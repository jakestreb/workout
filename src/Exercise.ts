import * as exercises from './sample_data/exercises.json';
import * as util from './util';

export default class Exercise {
	public static* generator(tag: string, previouslySelected: Exercise[]) {
		const selectedNames = previouslySelected.map(e => e.name);

		let remaining: any[] = exercises.filter(e => !selectedNames.includes(e.name) && e.tags.includes(tag));
		while (remaining.length > 0) {
			const selection = util.selectByWeight(remaining);
			remaining = selection.remaining;
			const repPatterns = getRepPatterns(selection.result);
			for (const reps of util.randomSelector(repPatterns)) {
				yield new Exercise(selection.result.name, reps);
			}
		}
		return;
	}

	constructor(public name: string, public reps: number[]) {
		console.log('exercise ->', name, reps);
	}
}

function getRepPatterns(exercise: any): number[][] {
	const result: number[][] = [];
	exercise.reps.forEach((r: number) => {
		exercise.sets.forEach((s: number) => {
			result.push(Array(s).fill(r));
		});
	});
	return result;
}
