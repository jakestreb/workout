import Exercise from './Exercise';

export interface Target {
	name: string;
	intensity: number;
	timeMinutes: number;
}

export interface MuscleTarget {
	muscle: string;
	desiredWeight: number;
	currentWeight: number;
}

export default class ExercisePicker {

	private exercises: Exercise[] = [];
	private generators: Generator<Exercise>[] = [];

	constructor(private tags: string[], private target: Target) {

	}

	public pick(): Exercise[]|void {
		if (this.exercises.length < this.tags.length) {
			const tag = this.tags[this.exercises.length];
			const generator = this.generators[this.exercises.length] || Exercise.generator(tag, this.exercises);
    		let currWorkoutStage = generator.next();
    		while (!currWorkoutStage.done) {
    			this.exercises.push(currWorkoutStage.value);
	    		if (this.verifyTargets()) {
	    			// Proceed
	    			return this.pick();
	    		}
				currWorkoutStage = generator.next();
	    	}
	    	if (this.exercises.length > 0) {
	    		this.exercises.pop();
	    		this.generators.pop();
	    		// Backtrack, but proceed
	    		return this.pick();
	    	}
	    	// Failed to generate a successful workout
	    	return;
		}
		// Success!
		return this.exercises;
	}

	public verifyTargets(): boolean {
		return !!this.target; // TODO
	}
}
