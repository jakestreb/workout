import ExerciseSet from './ExerciseSet';
import * as util from './util';

export default class WorkoutStage {
	public static* generator(stageTemplate: any) {
		let remaining: any[] = stageTemplate.tags;
		while (remaining.length > 0) {
			const selection = util.selectByWeight(remaining);
			remaining = selection.remaining;
			for (const set of ExerciseSet.generator(selection.result.name)) {
				yield new WorkoutStage(selection.result.name, set);
			}
		}
		return;
	}

	constructor(public tag: string, public set: ExerciseSet) {
		console.log('stage ->', tag, set);
	}
}
