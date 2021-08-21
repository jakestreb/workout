import ExerciseSet from './ExerciseSet';
import ExercisePicker from './ExercisePicker';
import * as workoutPatterns from './sample_data/workout_patterns.json';
import * as util from './util';

export default class Workout {
	public static* generator(name: string, intensity: number, timeMinutes: number) {
		let remaining: any[] = workoutPatterns;
		while (remaining.length > 0) {
			const selection = util.selectByWeight(remaining);
			remaining = selection.remaining;
			const exercisePicker = new ExercisePicker(selection.result.tags, { name, intensity, timeMinutes });
			const exercises = exercisePicker.pick();
			if (exercises) {
				remaining = workoutPatterns;
				yield new Workout(exercises);
			}
		}
		// Failed to find any successful pattern
		return;
	}

	constructor(public exercises: ExerciseSet[]) {
		console.log('new pattern ->', exercises);
	}
}
