import Exercise from './Exercise';
import RepsWeight from './RepsWeight';
import Score from '../muscles/Score';
import { Difficulty } from '../global/enum';
import * as util from '../global/util';
import db from '../db';

const oneMonthMs = 30 * 24 * 60 * 60 * 1000;

interface PersonalBests {
	endurance: RepsWeight;
	strength: RepsWeight;
}

export default class UserRecords {
	public static ENDURANCE_LOSS_PER_MONTH = 0.025;
	public static STRENGTH_LOSS_PER_MONTH = 0.015;

	public static QUALITY_CLIFF = 4;
	public static QUALITY_LIMIT = 12;

	public static async fromUserId(userId: number): Promise<UserRecords> {
		const [user, records] = await Promise.all([
			db.users.getOne(userId),
			db.records.getForUser(userId)
		]);
		return new UserRecords(user, records);
	}

	public readonly user: DBUser;

	private readonly _recordsByExercise: {[exercise: string]: DBRecord[]} = {};

	constructor(user: DBUser, userRecords: DBRecord[]) {
		this.user = user;
		userRecords.forEach(rec => {
			this._recordsByExercise[rec.exercise] = this._recordsByExercise[rec.exercise] || [];
			this._recordsByExercise[rec.exercise].push(rec);
		});
	}

	public getRecords(exercise: string): DBRecord[] {
		return this._recordsByExercise[exercise] || [];
	}

	public getAdjustedRecords(exercise: string): DBRecord[] {
		return this.getRecords(exercise)
			.filter((rec, i) => i < UserRecords.QUALITY_LIMIT)
			.map(rec => failureDegrade(rec))
			.map(rec => timeDegrade(rec))
			.map((rec, i) => qualityDegrade(rec, i));
	}

	// Note that this returns time-adjusted bests
	public getBestScores(exercise: string): Score|null {
		const records = this.getAdjustedRecords(exercise);
		const scores = records.map(rec => this._getRecordScore(exercise, rec));
		if (records.length === 0) {
			return null;
		}
		return new Score(
			{
				endurance: Math.max(...scores.map(rec => rec.endurance)),
				strength: Math.max(...scores.map(rec => rec.strength)),
			}
		);
	}

	// Note that this returns time-adjusted personal bests
	public getPersonalBests(exercise: string): PersonalBests|null {
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

	public getPossibleRepsWeights(exercise: string, focus: Skill, difficulty: Difficulty): RepsWeight[] {
		let rec: RepsWeight;
		const e = new Exercise(exercise);
		const bests = this.getPersonalBests(exercise);
		// const recs = this.getRecommendations(exercise);
		if (!bests) {
			rec = e.getFirstTryRepsWeight(this.user);
		} else if (focus === 'endurance') {
			const best = bests.endurance.copy();
			// Note that incrementing, then scaling the expected next value
			// gives a better result than scaling the previous directly
			rec = e.incReps(best)
				.scaleReps(0.75 + (difficulty * 0.25));
			// Add next rec (more reps) scaled by difficulty
			const stdWeight = e.getWeightStandard(this.user.gender);
			// If using more weight than std, add a decreased weight version
			const easierWeightRec = rec.copy().incWeight(-1);
			if (easierWeightRec.weight !== rec.weight && easierWeightRec.weight! >= stdWeight) {
				rec = easierWeightRec;
			}
		} else {
			const best = bests.strength.copy();
			rec = best.incWeight(difficulty);
			// Add next rec (more reps) scaled by difficulty
			const easierRepsRec = e.incReps(rec.copy(), -1);
			// If doing more reps than std, add a decreased rep version
			if (easierRepsRec.reps !== rec.reps && easierRepsRec.reps >= e.standardReps) {
				rec = easierRepsRec;
			}
		}
		return [
			rec.copy().setSets(2),
			rec.copy().setSets(3),
			rec.copy().setSets(4),
			rec.copy().setSets(5),
		];
	}

	private _getRecordScore(exercise: string, rec: DBRecord): Score {
		const repsWeight = getRepsWeight(rec);
		return new Exercise(exercise).getScore(repsWeight, this.user);
	}
}

function getRepsWeight(rec: DBRecord): RepsWeight {
	const { reps, sets, weight } = rec;
	return new RepsWeight({ reps, sets, weight });
}

function timeDegrade(rec: DBRecord): DBRecord {
	const monthsAgo = Math.floor((Date.now() - new Date(rec.created_at).getTime()) / oneMonthMs);
	const keepEndurance = Math.pow(1 - UserRecords.ENDURANCE_LOSS_PER_MONTH, monthsAgo);
	const keepStrength = Math.pow(1 - UserRecords.STRENGTH_LOSS_PER_MONTH, monthsAgo);
	return {
		...rec,
		reps: util.round(rec.reps * keepEndurance, 2),
		weight: util.round(rec.weight * keepStrength, 2),
	};
}

function failureDegrade(rec: DBRecord): DBRecord {
	return {
		...rec,
		sets: rec.completed ? rec.sets : 1,
	};
}

function qualityDegrade(rec: DBRecord, i: number): DBRecord {
	// Choose a slope such that at the limit, the factor is 0.5
	const slopeVal = (UserRecords.QUALITY_LIMIT - UserRecords.QUALITY_CLIFF) * 2;
	const c = (UserRecords.QUALITY_LIMIT * 2) - UserRecords.QUALITY_CLIFF - 1;
	const factor = (c - i) / slopeVal;
	return {
		...rec,
		reps: rec.reps * Math.min(factor, 1),
	};
}
