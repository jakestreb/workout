import type Exercise from './Exercise';
import RepsWeight from '../muscles/RepsWeight';
import Score from '../muscles/Score';
import * as util from '../global/util';
import db from '../db';

const oneMonthMs = 30 * 24 * 60 * 60 * 1000;

interface PersonalBests {
	endurance: RepsWeight,
	strength: RepsWeight
}

export default class UserRecords {
	public static ENDURANCE_LOSS_PER_MONTH = 0.04;
	public static STRENGTH_LOSS_PER_MONTH = 0.03;

	public static FAILURE_FACTOR = 0.5;

	public static async fromUserId(userId: number): Promise<UserRecords> {
		const [user, records] = await Promise.all([
			db.users.getOne(userId),
			db.records.getForUser(userId)
		]);
		return new UserRecords(user, records);
	}

	public readonly user: DBUser;

	private readonly _recordsByExercise: {[exercise: string]: DBRecord[]};

	constructor(user: DBUser, userRecords: DBRecord[]) {
		this.user = user;
		userRecords.forEach(rec => {
			this._recordsByExercise[rec.exercise] = this._recordsByExercise[rec.exercise] || [];
			this._recordsByExercise[rec.exercise].push(rec);
		});
	}

	public getRecords(exercise: Exercise): DBRecord[] {
		return this._recordsByExercise[exercise.name] || [];
	}

	public getAdjustedRecords(exercise: Exercise): DBRecord[] {
		return this.getRecords(exercise)
			.map(rec => failureDegrade(rec))
			.map(rec => timeDegrade(rec));
	}

	public getPersonalBests(exercise: Exercise): PersonalBests|null {
		const records = this.getAdjustedRecords(exercise);
		const scores = records.map(rec => this._getRecordScore(exercise, rec));
		if (records.length === 0) {
			return null;
		}
		const bestIndexes = {
			endurance: util.maxIndex(scores.map(s => s.endurance)),
			strength: util.maxIndex(scores.map(s => s.strength)),
		};
		return {
			endurance: getRepsWeight(records[bestIndexes.endurance]),
			strength: getRepsWeight(records[bestIndexes.strength]),
		};
	}

	public getBestScores(exercise: Exercise): Score|null {
		const records = this.getAdjustedRecords(exercise);
		const scores = records.map(rec => this._getRecordScore(exercise, rec));
		if (records.length === 0) {
			return null;
		}
		// TODO: Score should add some bonus confidence amount for number of times completed
		return new Score({
			endurance: Math.max(...scores.map(rec => rec.endurance)),
			strength: Math.max(...scores.map(rec => rec.strength)),
		});
	}

	private _getRecordScore(exercise: Exercise, record: DBRecord): Score {
		const { reps, sets, weight } = record;
		const repsWeight = new RepsWeight({
			reps: new Array(sets).fill(reps),
			weight,
		});
		return this._getTotalScore(exercise, repsWeight);
	}

	private _getTotalScore(exercise: Exercise, repsWeight: RepsWeight): Score {
		return exercise.getMuscleScores(repsWeight, this.user).total;
	}
}

function getRepsWeight(rec: DBRecord): RepsWeight {
	return new RepsWeight({
		reps: new Array(rec.sets).fill(rec.reps),
		weight: rec.weight
	});
}

function timeDegrade(rec: DBRecord): DBRecord {
	const monthsAgo = Math.floor((Date.now() - new Date(rec.created_at).getTime()) / oneMonthMs);
	const keepEndurance = (1 - UserRecords.ENDURANCE_LOSS_PER_MONTH) ^ monthsAgo;
	const keepStrength = (1 - UserRecords.STRENGTH_LOSS_PER_MONTH) ^ monthsAgo;
	return {
		...rec,
		reps: rec.reps * keepEndurance,
		weight: rec.weight * keepStrength,
	};
}

function failureDegrade(rec: DBRecord): DBRecord {
	return {
		...rec,
		reps: rec.reps * (rec.completed ? 1 : UserRecords.FAILURE_FACTOR)
	};
}
