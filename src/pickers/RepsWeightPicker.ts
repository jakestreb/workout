import DifficultyMatcher from '../matchers/DifficultyMatcher';
import SkillMatcher from '../matchers/SkillMatcher';
import BodyProfile from '../muscles/BodyProfile';
// import MuscleScores from '../muscles/MuscleScores';
import Exercise from '../exercises/Exercise';
import type UserRecords from '../exercises/UserRecords';
import Picker from './Picker';
import type WorkoutTarget from '../WorkoutTarget'
import Workout from '../Workout';
import WorkoutSet from '../WorkoutSet';
import { Difficulty, Result } from '../global/enum';
// import * as util from '../global/util';

export default class RepsWeightPicker extends Picker<WorkoutSet> {

	public final: WorkoutSet[]|null = null;

	private _exercises: Exercise[];
	private _skills: Skill[];
	private _difficulties: Difficulty[];

	private _target: WorkoutTarget;
	private _userRecords: UserRecords;
	// private _user: DBUser;

	private _recCache: { [exercise: string]: WorkoutSet } = {};

	// private _best: WorkoutSet[]|null = null;
	// private _bestDist: number = Infinity;

	constructor(exercises: Exercise[], target: WorkoutTarget, bodyProfile: BodyProfile) {
		super();

		this._exercises = exercises;

		const skillsMatcher = new SkillMatcher(exercises, bodyProfile);
		this._skills = skillsMatcher.getMatch();

		const difficultyMatcher = new DifficultyMatcher(exercises, this._skills, bodyProfile);
		this._difficulties = difficultyMatcher.getMatch(target.difficulty);

		this._target = target;
		this._userRecords = bodyProfile.userRecords;
		// this._user = bodyProfile.userRecords.user;
	}

	public get checks() {
		return [
			() => this._checkTime(),
			// () => this._checkFocus(),
		];
	}

	public get sets(): WorkoutSet[] {
		return this.items;
	}

	public get skill(): Skill {
		return this._skills[this.index];
	}

	public get difficulty(): Difficulty {
		return this._difficulties[this.index];
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

	// public getFinalYield(): WorkoutSet[]|null {
	// 	return this._best;
	// }

	private _checkTime(): Result {
		const w = new Workout(this.sets);
		if (this._target.checkTime(w.time) === Result.Complete) {
			return Result.Complete;
		}
		return Result.Failed;
	}

	// Pass on every new best within the max distance
	// private _checkFocus(): Result {
	// 	const scores = this.sets.map(s => s.getFocusScores(this._user));
	// 	const muscleScores = MuscleScores.combineExerciseScores(...scores);
	// 	const dist = this._target.avgScoreDistance(muscleScores);
	// 	if (dist < this._bestDist) {
	// 		this._best = this.sets.slice();
	// 		this._bestDist = dist;
	// 	}
	// 	return dist <= RepsWeightPicker.MAX_AVG_DIST ? Result.Complete : Result.Failed;
	// }

	private* _generateSets(exercise: Exercise) {
		yield this._getRecommendation(exercise);
		// for (const set of util.randomSelector(recs)) {
		// 	yield set;
		// }
	}

	private _getRecommendation(exercise: Exercise) {
		if (!this._recCache[exercise.name]) {
			const rec = this._userRecords.getRecommendation(
				exercise.name,
				this.skill,
				this.difficulty
			);

			// Remove duplicates
			// const isUniq = (val: any, i: number, self: any[]) => self.indexOf(val) === i;
			// const boolArray = scaled
			// 	.map(ws => `${ws.repsWeight}`)
			// 	.map(isUniq);
			// const uniqueScaled = scaled.filter((_, i) => boolArray[i]);
			// console.warn('(unique scaled)', exercise.name, uniqueScaled.map(w => w.repsWeight));

			this._recCache[exercise.name] = new WorkoutSet(exercise, rec);
		}
		return this._recCache[exercise.name];
	}
}

function* generateNothing() {
	return;
}
