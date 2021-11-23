import Exercise from '../exercises/Exercise';
import MuscleScore from './MuscleScore';
import RepsWeight from './RepsWeight';
import data from '../data';
import db from '../db';
import * as util from '../global/util';

interface PersonalBest {
	endurance: RepsWeight,
	strength: RepsWeight
}

interface ScoreMap {
	[muscle: string]: MuscleScore
};

const oneMonthMs = 30 * 24 * 60 * 60 * 1000;

export default class BodyProfile {

	public static ENDURANCE_LOSS_PER_MONTH = 0.04;
	public static STRENGTH_LOSS_PER_MONTH = 0.03;

	public static FAILURE_FACTOR = 0.5;

	public static REP_TOTAL_BONUS_FACTOR = 0.2;
	public static WEIGHT_REP_BONUS_FACTOR = 0.035;

	public static MIN_GOAL = 5;

	public static FIRST_TIME_WEIGHT_RATIO = 0.5;

	public static PERSONAL_BEST_DIFFICULTY_RATIOS = [0.7, 0.9, 1.1];

	public static async fromUserId(userId: number): Promise<BodyProfile> {
		const [user, records] = await Promise.all([
			db.users.getOne(userId),
			db.records.getForUser(userId)
		]);
		return new BodyProfile(user, records);
	}

	public readonly user: DBUser;
	public readonly recordsByExercise: {[exercise: string]: DBRecord[]};

	private readonly _scores: ScoreMap;
	private readonly _goalScores: ScoreMap;

	constructor(user: DBUser, records: DBRecord[]) {
		this.user = user;
		records.forEach(rec => {
			this.recordsByExercise[rec.exercise] ||= [];
			this.recordsByExercise[rec.exercise].push(rec);
		});

		this._init();
	}

	public getRecommendations(exercise: Exercise): RepsWeight[] {
		// Get personal bests for strength and endurance
		const best = this.getPersonalBest(exercise);
		if (!best) {
			// Return the standard reps given basic user information
			const standardWeight = exercise.getWeightStandard(this.user.gender);
			const ratio = BodyProfile.FIRST_TIME_WEIGHT_RATIO;
			return [
				new RepsWeight({
					reps: exercise.standardReps,
					weight: standardWeight ? standardWeight * ratio : null,
				})
			];
		}

		// Determine which skill to focus on, and choose the personal best
		// for that skill as a basis
		const exerciseSkillTotal = exercise.skills.strength + exercise.skills.endurance;
		const muscleFocusDecisions = exercise.muscles
			.map(m =>
				this._goalScores[m].copy().subtract(this._scores[m])
					.multiply(new MuscleScore(exercise.skills).divideBy(exerciseSkillTotal))
					.multiply(exercise.activityPerRep.getRatio(m))
			);
		const focusDecision = MuscleScore.combine(...muscleFocusDecisions);
		const isStrengthFocus = focusDecision.strength > focusDecision.endurance;
		const repsWeight = isStrengthFocus ? best.strength : best.endurance;

		// Scale reps and weight by difficulty ratios relative to their focus determinations
		const enduranceRatio = focusDecision.endurance / focusDecision.strength;
		const strengthRatio = 1 / enduranceRatio;

		repsWeight.scale({
			reps: Math.min(enduranceRatio, 1),
			weight: Math.min(strengthRatio, 1),
		});

		return BodyProfile.PERSONAL_BEST_DIFFICULTY_RATIOS.map(ratio =>
			repsWeight.copy().scale({
				reps: ratio,
				weight: ratio
			})
		);
	}

	public getRelativeScore(muscle: string): MuscleScore {
		const score = this._scores[muscle].copy();
		return score.subtract(this._goalScores[muscle]);
	}

	public getExerciseScore(exercise: Exercise): MuscleScore|null {
		const recordScores = this.getRecordScores(exercise);
		if (recordScores.length === 0) {
			return null;
		}

		// TODO: Score should add some bonus confidence amount for number of times completed
		return new MuscleScore({
			endurance: Math.max(...recordScores.map(rec => rec.endurance)),
			strength: Math.max(...recordScores.map(rec => rec.strength)),
		});
	}

	public getPersonalBest(exercise: Exercise): PersonalBest|null {
		const records = this._getAdjustedRecords(exercise.name);
		if (records.length === 0) {
			return null;
		}
		const scores = records.map(rec => this._getRecordScore(exercise, rec));
		const bestIndexes = {
			endurance: util.maxIndex(scores.map(s => s.endurance)),
			strength: util.maxIndex(scores.map(s => s.strength)),
		};
		return {
			endurance: getRepsWeight(records[bestIndexes.endurance]),
			strength: getRepsWeight(records[bestIndexes.strength]),
		};
	}

	public getRecordScores(exercise: Exercise): MuscleScore[] {
		const records = this._getAdjustedRecords(exercise.name);
		return records.map(rec => this._getRecordScore(exercise, rec));
	}

	private _getAdjustedRecords(exercise: string): DBRecord[] {
		return (this.recordsByExercise[exercise] || [])
			.map(rec => failureDegrade(rec))
			.map(rec => timeDegrade(rec));
	}

	private _getRecordScore(exercise: Exercise, record: DBRecord): MuscleScore {
		const { reps, sets, weight } = record;
		const standardWeight = exercise.getWeightStandard(this.user.gender);
		const weightFactor = standardWeight ? (weight / standardWeight) : 1;
		const endurance = (reps + BodyProfile.REP_TOTAL_BONUS_FACTOR * sets * reps) * weightFactor;

		// TODO: Use user weight to determine bodyweight strength scores
		const repFactor = (reps * sets) / exercise.repEstimate;
		const strength = weight + BodyProfile.WEIGHT_REP_BONUS_FACTOR * weight * repFactor;
		return new MuscleScore({ endurance, strength });
	}

	private _init() {
		const allExercises = data.exercises.all().map(e => new Exercise(e));
		const allScores = allExercises.map(exercise => this.getExerciseScore(exercise));

		const exercises = allExercises.filter((e, i) => allScores[i]);
		const exerciseScores = allScores.filter(s => s) as MuscleScore[];

		// Sums of strength/endurance exercise type weights over each muscle
		const muscleSkillSums = initScoreMap();
		exercises.forEach((exercise, i) => {
			exercise.muscles.forEach(m => {
				muscleSkillSums[m].add(new MuscleScore(exercise.skills));
			});
		});

		// Init muscle scores
		exercises.forEach((exercise, i) => {
			const exerciseScore = exerciseScores[i];
			const { activityPerRep } = exercise;
			exercise.muscles.forEach(m => {
				const muscleFactor = activityPerRep.getRatio(m);
				const skillFactor = new MuscleScore(exercise.skills)
					.divideBy(muscleSkillSums[m]);
				const muscleScore = exerciseScore
					.multiply(muscleFactor)
					.multiply(skillFactor);
				this._scores[m] ||= new MuscleScore();
				this._scores[m].add(muscleScore);
			});
		});

		// TODO: Save goals to db, allow users to modify
		// Init goal muscle scores
		const allMuscles = data.muscles.componentNames;
		const relativeScores = allMuscles
			.map(m => {
				const score = this._scores[m] || new MuscleScore();
				return score.copy().subtract(data.muscles.getDefaultScore(m));
			});

		const lowScores = MuscleScore.getPercentileScores(.25, ...relativeScores);
		const goalScores = MuscleScore.getPercentileScores(.75, ...relativeScores);
		const range = goalScores.copy().subtract(lowScores);

		const { primary_focus: primaryFocus } = this.user;
		if (range[primaryFocus] < BodyProfile.MIN_GOAL) {
			goalScores[primaryFocus] = lowScores[primaryFocus] + BodyProfile.MIN_GOAL;
		}

		allMuscles.forEach((m, i) => {
			const toReachGoal = goalScores.copy().subtract(relativeScores[i]);
			toReachGoal.strength = Math.max(toReachGoal.strength, 0);
			toReachGoal.endurance = Math.max(toReachGoal.endurance, 0);
			this._goalScores[m] = this._scores[m].copy().add(toReachGoal);
		});
	}
}

function getRepsWeight(rec: DBRecord): RepsWeight {
	return new RepsWeight({
		reps: new Array(rec.sets).fill(rec.reps),
		weight: rec.weight
	});
}

function initScoreMap(): {[muscle: string]: MuscleScore} {
	const ret: {[muscle: string]: MuscleScore} = {};
	data.muscles.names.forEach(m => { ret[m] = new MuscleScore(); });
	return ret;
}

function timeDegrade(rec: DBRecord): DBRecord {
	const monthsAgo = Math.floor((Date.now() - new Date(rec.created_at).getTime()) / oneMonthMs);
	const keepEndurance = (1 - BodyProfile.ENDURANCE_LOSS_PER_MONTH) ^ monthsAgo;
	const keepStrength = (1 - BodyProfile.STRENGTH_LOSS_PER_MONTH) ^ monthsAgo;
	return {
		...rec,
		reps: rec.reps * keepEndurance,
		weight: rec.weight * keepStrength,
	};
}

function failureDegrade(rec: DBRecord): DBRecord {
	return {
		...rec,
		reps: rec.reps * (rec.completed ? 1 : BodyProfile.FAILURE_FACTOR)
	};
}
