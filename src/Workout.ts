import TargetTracker from './TargetTracker';
import WorkoutStage from './WorkoutStage';
import * as workoutPatterns from './sample_data/workout_patterns.json';
import * as util from './util';

export interface Target {
  muscle: string;
  desiredWeight: number;
  currentWeight: number;
}

export default class Workout {
	public static* generator(targetName: string, intensity: number, timeMinutes: number) {
	    const targetTracker = new TargetTracker(targetName, intensity, timeMinutes);

		let remaining: any[] = workoutPatterns;
		while (remaining.length > 0) {
			const selection = util.selectByWeight(remaining);
			remaining = selection.remaining;
			const stages = Workout.pickStages(targetTracker, selection.result.stages, [], []);
			if (stages) {
				remaining = workoutPatterns;
				yield new Workout(stages);
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
		const count: number = stageTemplates.length;
		const selectedExercises: string[] = [];

		if (stages.length < count) {
			const template = stageTemplates[stages.length];
			const generator = stageGenerators[stages.length] || WorkoutStage.generator(template);
    		let currWorkoutStage = generator.next();
    		while (!currWorkoutStage.done) {
    			stages.push(currWorkoutStage.value);
	    		if (targetTracker.checkStages(stages)) {
	    			// Proceed
	    			return Workout.pickStages(targetTracker, stageTemplates, stages, stageGenerators);
	    		}
				currWorkoutStage = generator.next();
	    	}
	    	if (stages.length > 0) {
	    		stages.pop();
	    		stageGenerators.pop();
	    		// Backtrack, but proceed
	    		return Workout.pickStages(targetTracker, stageTemplates, stages, stageGenerators);
	    	}
	    	// Failed to generate a successful workout using this pattern
	    	return;
		}
		// Success!
		return stages;
	}

	constructor(public stages: WorkoutStage[]) {
		console.log('new pattern ->', stages);
	}
}
