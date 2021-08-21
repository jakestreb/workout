import Exercise from './Exercise';
import ExercisePicker from './ExercisePicker';
import * as rountines from './sample_data/routines.json';
import * as util from './util';

export default class Workout {
	public static* generator(name: string, intensity: number, timeMinutes: number) {
		for (const routine of util.weightedSelector(rountines)) {
			const exercisePicker = new ExercisePicker(routine.tags, { name, intensity, timeMinutes });
			const exercises = exercisePicker.pick();
			if (exercises) {
				yield new Workout(exercises);
			}
		}
		return;
	}

	constructor(public exercises: Exercise[]) {

	}
}
