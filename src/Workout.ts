import ExerciseSet from './ExerciseSet';
import ExercisePicker from './pickers/ExercisePicker';
import WorkoutTarget from './targets/WorkoutTarget';
import RepPicker from './pickers/RepPicker';

export default class Workout {

	public static* generator(name: string, intensity: number, timeMinutes: number) {
		const target = new WorkoutTarget(name, intensity, timeMinutes * 60);
		const exercisePicker = new ExercisePicker(target);

		for (const exercises of exercisePicker.pick()) {
			// console.warn(`exercises: ${exercises}\n`);
			const repPicker = new RepPicker(exercises, target);
			for (const sets of repPicker.pick()) {
				yield new Workout(sets);
				break;
			}
			// console.log(repPicker.getDiscrepancies().join('\n'));
		}
	}

	public readonly sets: ExerciseSet[];

	constructor(sets: ExerciseSet[]) {
		this.sets = sets;
	}

	public toString(): string {
		return `${this.sets.join('\n')}\n`;
	}
}
