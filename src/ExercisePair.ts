import * as exerciseRecords from './data/exercises.json';
import Exercise from './Exercise';
import MuscleActivity from './MuscleActivity';
import * as util from './global/util';

interface ExerciseRecord {
	name: string;
  	weight: number;
  	activations: Activation[];
  	secondsPerRep: number;
  	sets: number[];
  	reps: number[];
}

interface Activation {
	muscle: string;
	intensityPerRep: number;
}

export default class ExercisePair extends Exercise {

	public static swapTime: number = 80;

	public static* generator(exclude: string[] = []) {
		const filteredRecords: any[] = exerciseRecords.filter(e =>
			!exclude.includes(e.name)
		);

		for (const recordA of util.weightedSelector(filteredRecords)) {
			for (const recordB of util.weightedSelector(filteredRecords)) {
				if (recordA.name === recordB.name) {
					continue;
				}
				const pair = new ExercisePair(recordA, recordB);
				if (pair.sortIndex <= pair.second.sortIndex) {
					yield pair;
				}
			}
		}
	}

	public second: Exercise;

	constructor(recordA: ExerciseRecord, recordB: ExerciseRecord) {
		super(recordA);
		this.second = new Exercise(recordB);
	}

	public get names(): string[] {
		return [this.name, this.second.name];
	}

	public get possibleSets(): number[] {
		return util.overlapping(super.possibleSets, this.second.possibleSets);
	}

	public get possibleReps(): number[] {
		return util.overlapping(super.possibleReps, this.second.possibleReps);
	}

	public get timeEstimate(): number {
		return super.timeEstimate + this.second.timeEstimate +
			(util.avg(this.possibleSets) - 1) * (ExercisePair.swapTime - Exercise.restTime);
	}

	public get activityPerRep(): MuscleActivity {
		return MuscleActivity.combine(super.activityPerRep, this.second.activityPerRep);
	}

	public getTime(sets: number, reps: number) {
		return super.getTime(sets, reps) + this.second.getTime(sets, reps)
			+ (sets * 2 - 1) * ExercisePair.swapTime
			- ((sets - 1) * 2) * Exercise.restTime;
	}

	public toString(): string {
		return `${this.name} x ${this.second.name}`;
	}
}