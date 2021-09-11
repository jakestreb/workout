import ExercisePicker from './pickers/ExercisePicker';
import Workout from './Workout';
import WorkoutTarget from './targets/WorkoutTarget';
import RepPicker from './pickers/RepPicker';

export default class WorkoutGenerator {

	public readonly target: WorkoutTarget;

	constructor(name: string, intensity: number, timeMinutes: number) {
		this.target = new WorkoutTarget(name, intensity, timeMinutes * 60);
	}

	public* generate() {
		const exercisePicker = new ExercisePicker(this.target);

		for (const exercises of exercisePicker.pick()) {
			const repPicker = new RepPicker(exercises, this.target);
			for (const sets of repPicker.pick()) {
				yield new Workout(sets);
				break;
			}
		}
	}

	public throw(): void {
		this.target.throw();
	}
}
