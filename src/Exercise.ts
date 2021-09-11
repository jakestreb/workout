import * as exerciseRecords from './data/exercises.json';
import MuscleActivity from './MuscleActivity';
import WorkoutSet from './WorkoutSet';
import * as util from './util';

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

export default class Exercise {
	public static* generator(exclude: string[] = []) {
		const filteredRecords: any[] = exerciseRecords.filter(e =>
			!exclude.includes(e.name)
		);

		for (const exerciseRecord of util.weightedSelector(filteredRecords)) {
			yield new Exercise(exerciseRecord as ExerciseRecord);
		}
	}

	public static restTime: number = 60;
	public static transitionTime: number = 3 * 60;

	public readonly name: string;

	private readonly _secondsPerRep: number;
	private readonly _activityPerRep: MuscleActivity = new MuscleActivity();
	private readonly _possibleSets: number[];
	private readonly _possibleReps: number[];

	constructor(exerciseRecord: ExerciseRecord) {
		this.name = exerciseRecord.name;

		this._secondsPerRep = exerciseRecord.secondsPerRep;
		this._possibleSets = exerciseRecord.sets;
		this._possibleReps = exerciseRecord.reps;

		exerciseRecord.activations.forEach(a => {
			this._activityPerRep.set(a.muscle, a.intensityPerRep);
		});
	}

	public get names(): string[] {
		return [this.name];
	}

	public get possibleSets(): number[] {
		return this._possibleSets;
	}

	public get possibleReps(): number[] {
		return this._possibleReps;
	}

	public get timeEstimate(): number {
		const avgSets = util.avg(this.possibleSets);
		return avgSets * util.avg(this.possibleReps) * this._secondsPerRep + (avgSets - 1) * Exercise.restTime;
	}

	public get activityPerRep(): MuscleActivity {
		return this._activityPerRep;
	}

	public get sortIndex(): number {
		return -this._activityPerRep.total();
	}

	public getTime(sets: number, reps: number) {
		return reps * sets * this._secondsPerRep + (sets - 1) * Exercise.restTime;
	}

	public* generateSets(): Generator<WorkoutSet> {
		for (const reps of util.randomSelector(getRepPatterns(this.possibleSets, this.possibleReps))) {
			yield new WorkoutSet(this, reps);
		}
	}

	public toString(): string {
		return `${this.name}`;
	}
}

function getRepPatterns(sets: number[], reps: number[]): number[][] {
    const result: number[][] = [];
    reps.forEach((r: number) => {
        sets.forEach((s: number) => {
        	result.push(Array(s).fill(r));
		});
	});
    return result;
}
