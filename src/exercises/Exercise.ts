import BodyProfile from '../muscles/BodyProfile';
import MuscleScores from '../muscles/MuscleScores';
import RepsWeight from '../muscles/RepsWeight';
import Score from '../muscles/Score';
import * as util from '../global/util';
import data from '../data';

import type WorkoutTarget from '../WorkoutTarget';

export default class Exercise {
	public static REP_TOTAL_BONUS_FACTOR = 0.2;
	public static WEIGHT_REP_BONUS_FACTOR = 0.035;

	public static FIRST_TIME_WEIGHT_RATIO = 0.5;

	public static REST_TIME: number = 60;
	public static TRANSITION_TIME: number = 3 * 60;

	public static* generator(target: WorkoutTarget, exclude: string[] = []) {
		for (const exerciseRecord of target.exerciseRecords) {
			if (!exclude.includes(exerciseRecord.name)) {
				yield new Exercise(exerciseRecord);
			}
		}
	}


	public readonly name: string;

	private readonly _secondsPerRep: number;
	private readonly _scoresPerRep: MuscleScores = new MuscleScores();
	private readonly _possibleSets: number[];
	private readonly _possibleReps: number[];

	private readonly _record: JSONExercise;

	constructor(exerciseRec: JSONExercise) {
		this.name = exerciseRec.name;

		this._secondsPerRep = exerciseRec.secondsPerRep;
		this._possibleSets = exerciseRec.sets;
		this._possibleReps = exerciseRec.reps;

		exerciseRec.activations.forEach(a => {
			this._scoresPerRep.set(a.muscle,
				new Score({
					endurance: a.intensityPerRep * exerciseRec.skills.endurance,
					strength: a.intensityPerRep * exerciseRec.skills.strength,
				})
			);
		});

		this._record = exerciseRec;
	}

	public get names(): string[] {
		return [this.name];
	}

	public get possibleSets(): number[] {
		return this._possibleSets;
	}

	public get possibleReps(): number[] {
		return this._possibleReps;
	}

	public get standardReps(): number[] {
		const avgSets = this._possibleSets[this._possibleSets.length / 2]
		const avgReps = this._possibleReps[this._possibleReps.length / 2]
		return new Array(avgSets).fill(avgReps);
	}

	// TODO: Instead, use single standard reps value in exercise records
	public get repEstimate(): number {
		return util.avg(this.possibleSets) * util.avg(this.possibleReps);
	}

	public get scoresPerRep(): MuscleScores {
		return this._scoresPerRep;
	}

	public get sortIndex(): number {
		return -this._scoresPerRep.total * this.repEstimate;
	}

	public get skills() {
		return this._record.skills;
	}

	public get muscles(): string[] {
		return this.scoresPerRep.keys;
	}

	public get weight(): number {
		return this._record.weight;
	}

	public getWeightStandard(gender: DBUser['gender']): number|null {
		const record = this._record;
		if (record.isBodyweightExercise) {
			return null;
		}
		switch (gender) {
			case 'female':
				return record.weightStandards.female;
			case 'male':
				return record.weightStandards.male;
			default:
				return (record.weightStandards.male + record.weightStandards.female) / 2;
		}
	}

	public getTime(repsWeight: RepsWeight) {
		const { nReps, nSets } = repsWeight;
		return nReps * nSets * this._secondsPerRep + (nSets - 1) * Exercise.REST_TIME;
	}

	public getMuscleScores(repsWeight: RepsWeight, user: DBUser): MuscleScores {
		const reps = repsWeight.reps[0];
		const sets = repsWeight.reps.length;
		const weight = repsWeight.weight || user.weight;
		const standardWeight = this.getWeightStandard(user.gender);
		const weightFactor = standardWeight ? (weight / standardWeight) : 1;

		const enduranceScore = reps * weightFactor;
		const enduranceBonus = Exercise.REP_TOTAL_BONUS_FACTOR * sets * enduranceScore;
		const endurance = enduranceScore + enduranceBonus;

		const repFactor = (reps * sets) / this.repEstimate;
		const strengthScore = weight * weightFactor;
		const strengthBonus = Exercise.WEIGHT_REP_BONUS_FACTOR * repFactor * strengthScore;
		const strength = strengthScore + strengthBonus;

		const score = new Score({ endurance, strength });

		const muscleScores = new MuscleScores();
		data.muscles.names.forEach(m => {
			muscleScores.set(m, score.multiply(this.scoresPerRep.get(m)))
		});

		return muscleScores;
	}

	public getRecommendation(bodyProfile: BodyProfile): RepsWeight {
		const userRecords = bodyProfile.userRecords;
		const user = bodyProfile.userRecords.user;

		// Get personal bests for strength and endurance
		const best = userRecords.getPersonalBests(this);
		if (!best) {
			// Return the standard reps given basic user information
			const standardWeight = this.getWeightStandard(user.gender);
			const ratio = Exercise.FIRST_TIME_WEIGHT_RATIO;
			return new RepsWeight({
				reps: this.standardReps,
				weight: standardWeight ? standardWeight * ratio : null,
			});
		}

		// Determine which skill to focus on, and choose the personal best
		// for that skill as a basis
		const exerciseSkillTotal = this.skills.strength + this.skills.endurance;
		const muscleFocusDecisions = this.muscles
			.map(m =>
				bodyProfile.getGoalDiscrepancy(m)
					.multiply(new Score(this.skills).divideBy(exerciseSkillTotal))
					.multiply(this.scoresPerRep.get(m))
			);
		const focusDecision = Score.combine(...muscleFocusDecisions);
		const isStrengthFocus = focusDecision.strength > focusDecision.endurance;
		const repsWeight = isStrengthFocus ? best.strength : best.endurance;

		// Scale reps and weight by difficulty ratios relative to their focus determinations
		const enduranceRatio = focusDecision.endurance / focusDecision.strength;
		const strengthRatio = 1 / enduranceRatio;

		return repsWeight.scale({
			reps: Math.min(enduranceRatio, 1),
			weight: Math.min(strengthRatio, 1),
		});
	}

	public toString(): string {
		return `${this.name}`;
	}
}
