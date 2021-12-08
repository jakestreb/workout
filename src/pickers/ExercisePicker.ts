import Exercise from '../exercises/Exercise';
// import ExercisePair from '../exercises/ExercisePair';
import MuscleScores from '../muscles/MuscleScores';
import Picker from './Picker';
import WorkoutTarget from '../WorkoutTarget';

export default class ExercisePicker extends Picker<Exercise> {

	private readonly _target: WorkoutTarget;

	constructor(target: WorkoutTarget) {
		super();

		this._target = target;
	}

	public get checks() {
		return [
			() => this._checkOrder(),
			() => this._checkFocus()
		];
	}

	public get exercises() {
		return this.items;
	}

	public buildGenerator(): Generator<Exercise> {
		const selected: string[] = [];
		this.exercises.forEach(e => {
			selected.push(...e.names);
		});
		return anyGenerator(this._target, selected);
	}

	private _checkOrder(): Result {
		for (let i = 1; i < this.exercises.length; i++) {
			if (this.exercises[i].sortIndex < this.exercises[i - 1].sortIndex) {
				return Result.Failed;
			}
		}
		return Result.Complete;
	}

	private _checkFocus(): Result {
		const scoresPerRep = MuscleScores.combine(...this.exercises.map(e => e.scoresPerRep));

		return this._target.checkFocusMuscles(scoresPerRep) ? Result.Complete : Result.Incomplete;
	}
}

function* anyGenerator(target: WorkoutTarget, previouslySelected: string[] = []): Generator<Exercise> {
	const gens: Generator<Exercise>[] = [
		Exercise.generator(target, previouslySelected),
		// TODO: Re-add supersets
		// ExercisePair.generator(target, previouslySelected)
	];
	while (gens.length > 0) {
		const index = Math.floor(Math.random() * gens.length);
		const curr = gens[index].next();
		if (curr.done) {
			gens.splice(index, 1);
			continue;
		}
		yield curr.value;
	}
}
