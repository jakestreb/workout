import MuscleScores from '../muscles/MuscleScores';
import Exercise from '../exercises/Exercise';
import type UserRecords from '../exercises/UserRecords';
import Picker from './Picker';
import type WorkoutTarget from '../WorkoutTarget'
import Workout from '../Workout';
import WorkoutSet from '../WorkoutSet';
import { Result } from '../global/enum';
import * as util from '../global/util';

export default class RepsWeightPicker extends Picker<WorkoutSet> {

	// TODO: Lower
	public static MAX_AVG_DIST = 100000;

	public final: WorkoutSet[]|null = null;

	private _exercises: Exercise[];
	private _target: WorkoutTarget;
	private _userRecords: UserRecords;
	private _user: DBUser;

	private _cachedRecs: { [exercise: string]: WorkoutSet[] } = {};

	private _best: WorkoutSet[]|null = null;
	private _bestDist: number = Infinity;

	constructor(exercises: Exercise[], target: WorkoutTarget, userRecords: UserRecords) {
		super();

		this._exercises = exercises;
		this._target = target;
		this._userRecords = userRecords;
		this._user = userRecords.user;
	}

	public get checks() {
		return [
			() => this._checkTime(),
			() => this._checkFocus(),
		];
	}

	public get sets(): WorkoutSet[] {
		return this.items;
	}

	public buildGenerator(): Generator<WorkoutSet> {
		if (this.index < this._exercises.length) {
			return this._generateSets(this._exercises[this.index]);
		}
		return generateNothing();
	}

	public checkProgress(): Result {
		if (this.index < this._exercises.length) {
			return Result.Incomplete;
		}
		return super.checkProgress();
	}

	public getFinalYield(): WorkoutSet[]|null {
		return this._best;
	}

	private _checkTime(): Result {
		const w = new Workout(this.sets);
		if (this._target.checkTime(w.time) === Result.Complete) {
			return Result.Complete;
		}
		return Result.Failed;
	}

	// Pass on every new best within the max distance
	private _checkFocus(): Result {
		const scores = this.sets.map(s => s.getFocusScores(this._user));
		const muscleScores = MuscleScores.combineExerciseScores(...scores);
		const dist = this._target.avgScoreDistance(muscleScores);
		if (dist < this._bestDist) {
			this._best = this.sets.slice();
			this._bestDist = dist;
		}
		return dist <= RepsWeightPicker.MAX_AVG_DIST ? Result.Complete : Result.Failed;
	}

	private* _generateSets(exercise: Exercise) {
		const recs = this._getRecommendations(exercise);
		for (const set of util.randomSelector(recs)) {
			yield set;
		}
	}

	private _getRecommendations(exercise: Exercise) {
		if (!this._cachedRecs[exercise.name]) {
			const recs = this._userRecords.getRecommendations(exercise.name);
			const sets = recs.map(r => new WorkoutSet(exercise, r));

			// Remove duplicates
			const isUniq = (val: any, i: number, self: any[]) => self.indexOf(val) === i;
			const boolArray = scaled
				.map(ws => `${ws.repsWeight}`)
				.map(isUniq);
			const uniqueScaled = scaled.filter((_, i) => boolArray[i]);
			console.warn('(unique scaled)', exercise.name, uniqueScaled.map(w => w.repsWeight));

			this._cachedRecs[exercise.name] = uniqueScaled;
		}
		return this._cachedRecs[exercise.name];
	}
}

function* generateNothing() {
	return;
}
