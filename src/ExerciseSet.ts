import ExerciseReps from './ExerciseReps';
import * as exercises from './sample_data/exercises.json';
import * as util from './util';

export default class ExerciseSet {
	public static* generator(tag: string) {
		const repsGenerator = ExerciseReps.generator();
		let remaining: any[] = exercises.filter(e => e.tags.includes(tag));
		while (remaining.length > 0) {
			const selection = util.selectByWeight(remaining);
			remaining = selection.remaining;
			for (const reps of repsGenerator) {
				yield new ExerciseSet(selection.result.name, reps);
			}
		}
		return;
	}

	constructor(public name: string, public reps: ExerciseReps) {
		console.log('set ->', name, reps);
	}
}
