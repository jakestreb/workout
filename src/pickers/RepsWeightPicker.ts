import DifficultyMatcher from '../matchers/DifficultyMatcher';
import SkillMatcher from '../matchers/SkillMatcher';
import Exercise from '../exercises/Exercise';
import type UserRecords from '../exercises/UserRecords';
import Picker from './Picker';
import type WorkoutTarget from '../WorkoutTarget'
import Workout from '../Workout';
import WorkoutSet from '../WorkoutSet';
import { Difficulty, Result } from '../global/enum';
import * as util from '../global/util';

export default class RepsWeightPicker extends Picker<WorkoutSet> {

	public final: WorkoutSet[]|null = null;

	private _exercises: Exercise[];
	private _skills: Skill[];
	private _difficulties: Difficulty[];

	private _target: WorkoutTarget;
	private _userRecords: UserRecords;

	private _recCache: { [exercise: string]: WorkoutSet[] } = {};

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
		const recs = this._getRecommendations(exercise);
		for (const set of util.randomSelector(recs)) {
			yield set;
		}
	}

	private _getRecommendations(exercise: Exercise): WorkoutSet[] {
		if (!this._recCache[exercise.name]) {
			const recs = this._userRecords.getPossibleRepsWeights(
				exercise.name,
				this.skill,
				this.difficulty
			);
			this._recCache[exercise.name] = recs.map(r => new WorkoutSet(exercise, r));
		}
		return this._recCache[exercise.name];
	}
}

function* generateNothing() {
	return;
}
