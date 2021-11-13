import ExercisePicker from '../pickers/ExercisePicker';
import LookaheadGenerator from './LookaheadGenerator';
import Workout from '../Workout';
import WorkoutTarget from '../targets/WorkoutTarget';
import RepPicker from '../pickers/RepPicker';

// TODO: Why is this needed?
interface Target {
	muscles: string[];
	intensity: number;
	timeMinutes: number;
}

export default class WorkoutGenerator extends LookaheadGenerator {

	public target: WorkoutTarget;

	constructor({ muscles, intensity, timeMinutes }: Target) {
		super({ muscles, intensity, timeMinutes });
		this.target = new WorkoutTarget(muscles, intensity, timeMinutes * 60);
	}

	public* generate(): Generator<Workout> {
		const exercisePicker = new ExercisePicker(this.target);

		for (const exercises of exercisePicker.pick()) {
			const repPicker = new RepPicker(exercises!, this.target);
			for (const sets of repPicker.pick()) {
				yield new Workout(sets!);
				break;
			}
		}
	}

	public throw(): void {
		this.target.throw();
	}
}
