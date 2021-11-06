import Exercise from './exercises/Exercise';
import * as exerciseRecords from './data/exercises.json';
import db from './db/db';

interface RepsWeight {
	reps: number[];
	weight: number;
}

interface Instance {
	reps: number;
	weight: number;
}

const oneMonthMs = 30 * 24 * 60 * 60 * 1000;

export default class BodyProfile {

	public static ENDURANCE_LOSS_PER_MONTH = 0.04;
	public static STRENGTH_LOSS_PER_MONTH = 0.03;

	public static FAILURE_FACTOR = 0.5;

	public static REP_TOTAL_BONUS_FACTOR = 0.2;
	public static WEIGHT_REP_BONUS_FACTOR = 0.035;

	public static ENDURANCE_FOCUS_FACTOR = 0.8;
	public static STRENGTH_FOCUS_FACTOR = 0.8;

	public static ENDURANCE_NON_FOCUS_FACTOR = 0.5;
	public static STRENGTH_NON_FOCUS_FACTOR = 0.5;

	public static async fromUserId(userId: number): Promise<BodyProfile> {
		const [user, records] = await Promise.all([
			db.users.getOne(userId),
			db.records.getForUser(userId)
		]);
		return new BodyProfile(user, records);
	}

	public readonly user: DBUser;
	public readonly records: DBRecord[];

	private readonly _endurance: {[muscle: string]: number} = {};
	private readonly _strength: {[muscle: string]: number} = {};

	constructor(user: DBUser, records: DBRecord[]) {
		this.user = user;
		this.records = records;
	}

	public getRecommendation(exercise: string): RepsWeight {
		const { primary_focus } = this.user;

		// PICK PREVIOUS INSTANCE TO IMPROVE ON IN ONE WAY
		// TRADE OFF BTWN MOST RECENT AND BEST
	}

	public getScores(exercise: Exercise): { endurance: number, strength: number }|null {
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
		let totalEffect = {
			endurance: 0,
			strength: 0,
		};
		const exercises = exerciseRecords.map(e => new Exercise(e));
		const allScores = exercises.map(exercise => {
			const scores = this.getScores(exercise);
			if (scores) {
				totalEffect.endurance += exercise.enduranceEffect;
				totalEffect.strength += exercise.strengthEffect;
			}
			return scores;
		});
		exercises.forEach((exercise, i) => {
			const score = allScores[i];
			if (score) {
				const { endurance, strength } = score;
				const { activityPerRep } = exercise;
				activityPerRep.keys.forEach(muscle => {
					const muscleFactor = activityPerRep.get(muscle) / activityPerRep.total;
					const enduranceFactor = exercise.enduranceEffect / totalEffect.endurance;
					const strengthFactor = exercise.strengthEffect / totalEffect.strength;
					// MUST DIVIDE BY # OF EXERCISES DECIDING MUSCLE
					this._endurance[muscle] += endurance * muscleFactor * enduranceFactor;
					this._strength[muscle] += strength * muscleFactor * strengthFactor;
				});
			}
		});
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
