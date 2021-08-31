import ExerciseSet from './ExerciseSet';
import ExercisePicker from './ExercisePicker';
import MuscleActivityTarget from './MuscleActivityTarget';
import RepPicker from './RepPicker';

export default class Workout {

	public static maxLeftoverTime: number = 5 * 60;

	public static* generator(name: string, intensity: number, timeMinutes: number) {
		const time = timeMinutes * 60;

		const activityTarget = MuscleActivityTarget.fromTarget(name, intensity, time);

		const exercisePicker = new ExercisePicker(activityTarget, time);

		for (const exercises of exercisePicker.pick()) {
			// console.warn(`exercises: ${exercises}\n`);
			const repPicker = new RepPicker(exercises, activityTarget, time);
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
