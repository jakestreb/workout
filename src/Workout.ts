import Exercise from './Exercise';
import ExercisePicker from './ExercisePicker';
import * as rountines from './sample_data/routines.json';
import * as util from './util';

export default class Workout {
	public static* generator(name: string, intensity: number, timeMinutes: number) {
		let remaining: any[] = rountines;
		while (remaining.length > 0) {
			const selection = util.selectByWeight(remaining);
			remaining = selection.remaining;
			const exercisePicker = new ExercisePicker(selection.result.tags, { name, intensity, timeMinutes });
			const exercises = exercisePicker.pick();
			if (exercises) {
				remaining = rountines;
				yield new Workout(exercises);
			}
		}
		// Failed to find any successful pattern
		return;
	}

	constructor(public exercises: Exercise[]) {
		console.log('new pattern ->', exercises);
	}
}
