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
	public static* generator(previouslySelected: Exercise[] = []) {
		const selectedNames = previouslySelected.map(e => e.name);
		const filteredRecords: any[] = exerciseRecords.filter(e =>
			!selectedNames.includes(e.name)
		);

		for (const exerciseRecord of util.weightedSelector(filteredRecords)) {
			yield new Exercise(exerciseRecord as ExerciseRecord);
		}
		return;
	}

	public static restTime: number = 60;
	public static transitionTime: number = 3 * 60;

	public readonly name: string;
	public readonly totalActivityPerRep: number;
	public readonly secondsPerRep: number;
	public readonly activityPerRep: MuscleActivity = new MuscleActivity();
	public readonly timeEstimate: number;

	private readonly _possibleSets: number[];
	private readonly _possibleReps: number[];

	constructor(exerciseRecord: ExerciseRecord) {
		this.name = exerciseRecord.name;
		this.totalActivityPerRep = util.sum(exerciseRecord.activations.map(a => a.intensityPerRep));
		this.secondsPerRep = exerciseRecord.secondsPerRep;

		this._possibleSets = exerciseRecord.sets;
		this._possibleReps = exerciseRecord.reps;

		const avgSets = util.avg(this._possibleSets);
		this.timeEstimate = avgSets * util.avg(this._possibleReps) * this.secondsPerRep
			+ (avgSets - 1) * Exercise.restTime;

		exerciseRecord.activations.forEach(a => {
			this.activityPerRep.set(a.muscle, a.intensityPerRep);
		});
	}

	public get sortIndex(): number {
		return -this.totalActivityPerRep;
	}

	public* generateSets(): Generator<WorkoutSet> {
		for (const reps of util.randomSelector(getRepPatterns(this._possibleSets, this._possibleReps))) {
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
