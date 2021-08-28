import Exercise from './Exercise';
import ExercisePicker from './ExercisePicker';

export default class Workout {
	public static* generator(name: string, intensity: number, timeMinutes: number) {
		const exercisePicker = new ExercisePicker({ name, intensity, time: timeMinutes * 60 });
		for (const exercises of exercisePicker.pick()) {
			yield new Workout(exercises);
		}
		return exercisePicker.getDiscrepancies().join('\n');
	}

	public readonly exercises: Exercise[];

	constructor(exercises: Exercise[]) {
		this.exercises = exercises;
	}

	public toString(): string {
		return `${this.exercises.join('\n')}\n`;
	}
}
