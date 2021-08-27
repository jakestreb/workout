import Exercise from './Exercise';
import ExercisePicker from './ExercisePicker';
import * as routines from './data/routines.json';
import * as util from './util';

export default class Workout {
	public static* generator(name: string, intensity: number, timeMinutes: number) {
		for (const routine of util.weightedSelector(routines)) {
			const exercisePicker = new ExercisePicker(routine.tags, { name, intensity, time: timeMinutes * 60 });
			const exercises = exercisePicker.pick();
			if (exercises) {
				yield new Workout(exercises);
			}
		}
		return;
	}

	public readonly exercises: Exercise[];

	constructor(exercises: Exercise[]) {
		this.exercises = exercises;
	}

	public toString(): string {
		return `${this.exercises.join('\n')}\n`;
	}
}
