import ExercisePicker from './pickers/ExercisePicker';
import WorkoutSet from './WorkoutSet';
import WorkoutTarget from './targets/WorkoutTarget';
import RepPicker from './pickers/RepPicker';

export default class Workout {

	public static* generator(name: string, intensity: number, timeMinutes: number) {
		const target = new WorkoutTarget(name, intensity, timeMinutes * 60);
		const exercisePicker = new ExercisePicker(target);

		for (const exercises of exercisePicker.pick()) {
			const repPicker = new RepPicker(exercises, target);
			for (const sets of repPicker.pick()) {
				yield new Workout(sets);
				break;
			}
		}
		target.throw();
	}

	public readonly sets: WorkoutSet[];

	constructor(sets: WorkoutSet[]) {
		this.sets = sets;
	}

	public toString(): string {
		return `${this.sets.join('\n')}\n`;
	}
}
