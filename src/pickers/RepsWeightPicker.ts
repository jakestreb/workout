import DifficultyMatcher from '../matchers/DifficultyMatcher';
import SkillMatcher from '../matchers/SkillMatcher';
import Exercise from '../exercises/Exercise';
import type UserRecords from '../exercises/UserRecords';
import Picker from './Picker';
import type WorkoutTarget from '../WorkoutTarget'
import Workout from '../Workout';
import WorkoutSet from '../WorkoutSet';
import { Difficulty, Result } from '../global/enum';

export default class RepsWeightPicker extends Picker<WorkoutSet> {

	public final: WorkoutSet[]|null = null;

	private _exercises: Exercise[];
	private _skills: Skill[];
	private _difficulties: Difficulty[];

	private _target: WorkoutTarget;
	private _userRecords: UserRecords;

	private _recCache: { [exercise: string]: WorkoutSet } = {};

	constructor(exercises: Exercise[], target: WorkoutTarget, userRecords: UserRecords) {
		super();

		this._exercises = exercises;

		const skillsMatcher = new SkillMatcher(exercises, target);
		this._skills = skillsMatcher.getMatch();

		const difficultyMatcher = new DifficultyMatcher(exercises, this._skills, target);
		this._difficulties = difficultyMatcher.getMatch();

		this._target = target;
		this._userRecords = userRecords;
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

	private _checkTime(): Result {
		const w = new Workout(this.sets);
		if (this._target.checkTime(w.time) === Result.Complete) {
			return Result.Complete;
		}
		return Result.Failed;
	}

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
			this._recCache[exercise.name] = new WorkoutSet(exercise, rec);
		}
		return this._recCache[exercise.name];
	}
}

function* generateNothing() {
	return;
}
