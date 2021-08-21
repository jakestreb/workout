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

	private capacity: number;
	private exercises: Exercise[] = [];
	private generators: Generator<Exercise>[] = [];

	constructor(private tags: string[], private target: Target) {
		this.capacity = tags.length;
	}

	public pick(): Exercise[]|void {
		if (this.exercises.length === this.capacity) {
			return this.exercises;
		}
		const tag = this.tags[this.exercises.length];
		const generator = this.generators[this.exercises.length] || Exercise.generator(tag, this.exercises);

		// Try exercises from current generator until one works
		for (const exercise of generator) {
			this.exercises.push(exercise);
    		if (this.verifyTargets()) {
    			return this.pick();
    		}
    		this.exercises.pop();
    	}

    	// If no exercises from current generator work, backtrack
    	if (this.exercises.length > 0) {
    		this.exercises.pop();
    		this.generators.pop();
    		return this.pick();
    	}
    	return;
	}

	public verifyTargets(): boolean {
		return !!this.target; // TODO
	}
}
