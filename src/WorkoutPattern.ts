import TargetTracker from './TargetTracker';
import WorkoutStage from './WorkoutStage';
import * as workoutPatterns from './sample_data/workout_patterns.json';
import * as util from './util';

export default class WorkoutPattern {
	public static* generator(targetTracker: TargetTracker) {
		let remaining: any[] = workoutPatterns;
		while (remaining.length > 0) {
			const selection = util.selectByWeight(remaining);
			remaining = selection.remaining;
			const stages = WorkoutPattern.pickStages(targetTracker, selection.result.stages, [], []);
			if (stages) {
				yield new WorkoutPattern(stages);
			}
		}
		// Failed to find any successful pattern
		return;
	}

	public static pickStages(
		targetTracker: TargetTracker,
		stageTemplates: any[],
		stages: WorkoutStage[],
		stageGenerators: Generator<WorkoutStage>[]
	): WorkoutStage[]|void {
		const count = stageTemplates.length;
		if (stages.length < count) {
			const template = stageTemplates[stages.length];
			const generator = stageGenerators[stages.length] || WorkoutStage.generator(template);
    		let currWorkoutStage = generator.next();
    		while (!currWorkoutStage.done) {
    			stages.push(currWorkoutStage.value);
	    		if (targetTracker.checkStages(stages)) {
	    			// Proceed
	    			return WorkoutPattern.pickStages(targetTracker, stageTemplates, stages, stageGenerators);
	    		} else {
					currWorkoutStage = generator.next();
	    		}
	    	}
	    	if (stages.length > 0) {
	    		stages.pop();
	    		stageGenerators.pop();
	    		// Backtrack, but proceed
	    		return WorkoutPattern.pickStages(targetTracker, stageTemplates, stages, stageGenerators);
	    	} else {
	    		// Failed to generate a successful workout using this pattern
	    		return;
	    	}
		}
		// Success!
		return stages;
	}

	constructor(public stages: WorkoutStage[]) {
		console.log('new pattern ->', stages);
	}
}
