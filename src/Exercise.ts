import * as exerciseRecords from './sample_data/exercises.json';
import * as util from './util';

export default class Exercise {
	public static* generator(tag: string, previouslySelected: Exercise[]) {
		const selectedNames = previouslySelected.map(e => e.name);
		const filteredRecords: any[] = exerciseRecords.filter(e =>
			!selectedNames.includes(e.name) && e.tags.includes(tag)
		);

		for (const exerciseRecord of util.weightedSelector(filteredRecords)) {
			const repPatterns = getRepPatterns(exerciseRecord);
			for (const reps of util.randomSelector(repPatterns)) {
				yield new Exercise(exerciseRecord.name, reps);
			}
		}
		return;
	}

	constructor(public name: string, public reps: number[]) {

	}
}

function getRepPatterns(exerciseRecord: any): number[][] {
	const result: number[][] = [];
	exerciseRecord.reps.forEach((r: number) => {
		exerciseRecord.sets.forEach((s: number) => {
			result.push(Array(s).fill(r));
		});
	});
	return result;
}
