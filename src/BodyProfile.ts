import Exercise from './exercises/Exercise';
import data from './data';
import db from './db';

interface RepsWeight {
	reps: number[];
	weight: number;
}

interface Score {
	endurance: number,
	strength: number
}

interface ScoreMap {
	[muscle: string]: Score
}

const oneMonthMs = 30 * 24 * 60 * 60 * 1000;

export default class BodyProfile {

	public static ENDURANCE_LOSS_PER_MONTH = 0.04;
	public static STRENGTH_LOSS_PER_MONTH = 0.03;

	public static FAILURE_FACTOR = 0.5;

	public static REP_TOTAL_BONUS_FACTOR = 0.2;
	public static WEIGHT_REP_BONUS_FACTOR = 0.035;

	public static async fromUserId(userId: number): Promise<BodyProfile> {
		const [user, records] = await Promise.all([
			db.users.getOne(userId),
			db.records.getForUser(userId)
		]);
		return new BodyProfile(user, records);
	}

	public readonly user: DBUser;
	public readonly records: DBRecord[];

	private readonly _scores: ScoreMap;
	private readonly _averageScore: Score;
	private readonly _minScore: Score;

	constructor(user: DBUser, records: DBRecord[]) {
		this.user = user;
		this.records = records;

		this._init();
	}

	public getRecommendation(exercise: Exercise): RepsWeight {
		const { primary_focus: primaryFocus } = this.user;

		const recs = exercise.muscles.map(m => {
			const { endurance, strength } = this.getMuscleRecomendations(m, primaryFocus);
			const activityFactor = exercise.activityPerRep.getRatio(m);
			return {
				endurance: endurance * activityFactor,
				strength: strength * activityFactor
			};
		});

		let total = recs.reduce((a, b) => ({
			strength: a.strength + b.strength,
			endurance: a.endurance + b.endurance
		}));

		total.strength *= exercise.skills.strength;
		total.endurance *= exercise.skills.endurance;

		const records = this.records.filter(rec => rec.exercise === exercise.name)
			.map(rec => failureDegrade(rec))
			.map(rec => timeDegrade(rec));
		if (records.length === 0) {

		}

		return {
			reps: [5, 5, 5, 5, 5],
			weight: 10
		};
		// PICK PREVIOUS INSTANCE TO IMPROVE ON IN ONE WAY
		// TRADE OFF BTWN MOST RECENT AND BEST
	}

	public getMuscleRecomendations(muscle: string, primaryFocus: string): Score {
		const { endurance, strength } = this._scores[muscle];
		const { endurance: avgEndurance, strength: avgStrength } = this._averageScore;

		if (primaryFocus === 'endurance') {
			return {
				endurance: endurance - this._minScore.endurance,
				strength: avgStrength - strength
			};
		}
		return {
			endurance: avgEndurance - endurance,
			strength: strength - this._minScore.strength
		};
	}

	public getScore(exercise: Exercise): Score|null {
		const records = this.records.filter(rec => rec.exercise === exercise.name)
			.map(rec => failureDegrade(rec))
			.map(rec => timeDegrade(rec));
		if (records.length === 0) {
			return null;
		}
		const enduranceScores = records.map(rec => {
			const { reps, sets, weight } = rec;
			const standard = exercise.getWeightStandard(this.user.gender);
			const weightFactor = standard ? (weight / standard) : 1;
			return (reps + BodyProfile.REP_TOTAL_BONUS_FACTOR * (sets * reps)) * weightFactor;
		});
		// TODO: Use user weight to determine bodyweight strength scores
		const strengthScores = records.map(rec => {
			const { reps, sets, weight } = rec;
			const repFactor = (reps * sets) / exercise.repEstimate;
			return weight + BodyProfile.WEIGHT_REP_BONUS_FACTOR * weight * repFactor;
		});
		return {
			endurance: Math.max(...enduranceScores),
			strength: Math.max(...strengthScores),
		};
	}

	private _init() {
		const allExercises = data.exercises.all().map(e => new Exercise(e));
		const allScores = allExercises.map(exercise => this.getScore(exercise));

		const exercises = allExercises.filter((e, i) => allScores[i]);
		const scores = allScores.filter(s => s) as Score[];

		// Init muscle scores
		const totalSkillWeights: { [muscle: string]: Score } = {};

		exercises.forEach((exercise, i) => {
			exercise.muscles.forEach(muscle => {
				totalSkillWeights[muscle] = totalSkillWeights[muscle] || { endurance: 0, strength: 0 };
				totalSkillWeights[muscle].endurance += exercise.skills.endurance;
				totalSkillWeights[muscle].strength += exercise.skills.strength;
			});
		});

		exercises.forEach((exercise, i) => {
			const score = scores[i];
			const { endurance, strength } = score;
			const { activityPerRep } = exercise;
			exercise.muscles.forEach(muscle => {
				const { endurance: totalEndurance, strength: totalStrength } = totalSkillWeights[muscle];
				const muscleFactor = activityPerRep.getRatio(muscle);
				const enduranceFactor = exercise.skills.endurance / totalEndurance;
				const strengthFactor = exercise.skills.strength / totalStrength;
				this._scores[muscle].endurance += endurance * muscleFactor * enduranceFactor;
				this._scores[muscle].strength += strength * muscleFactor * strengthFactor;
			});
		});

		// Init average score
		const muscles = Object.keys(this._scores)
		let totalMuscleWeight: number = 0;

		muscles.forEach(muscle => {
			totalMuscleWeight += data.muscles.getWeight(muscle);
		});

		muscles.forEach(muscle => {
			const muscleFactor = data.muscles.getWeight(muscle) / totalMuscleWeight;
			this._averageScore.endurance += this._scores[muscle].endurance * muscleFactor;
			this._averageScore.strength += this._scores[muscle].strength * muscleFactor;
		});

		this._minScore.endurance = Math.min(...muscles.map(m => this._scores[m].endurance));
		this._minScore.strength = Math.min(...muscles.map(m => this._scores[m].strength));
	}
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
