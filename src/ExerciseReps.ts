import * as rep_patterns from './sample_data/rep_patterns.json';
import * as util from './util';

export default class ExerciseReps {
	public static* generator() {
		let remaining: any[] = rep_patterns;
		while (remaining.length > 0) {
			const selection = util.selectByWeight(remaining);
			remaining = selection.remaining;
			const pattern = selection.result.pattern;
			for (let i = selection.result.minLength; i < pattern.length; i++) {
				yield new ExerciseReps(pattern);
			}
		}
		return;
	}

	constructor(public reps: number[]) {
		console.log('reps ->', reps);
	}
}
