import * as exerciseRecords from './data/exercises.json';
import MuscleActivity from './MuscleActivity';
import * as util from './util';

interface ExerciseRecord {
	name: string;
  	weight: number;
  	activations: Activation[];
  	secondsPerRep: number;
  	sets: number[];
  	reps: number[];
  	tags: string[];
}

interface Activation {
	muscle: string;
	intensityPerRep: number;
}

const REST_TIME_S = 60;

export default class Exercise {
	public static* generator(tag: string, previouslySelected: Exercise[]) {
		const selectedNames = previouslySelected.map(e => e.name);
		const filteredRecords: any[] = exerciseRecords.filter(e =>
			!selectedNames.includes(e.name) && e.tags.includes(tag)
		);

		for (const exerciseRecord of util.weightedSelector(filteredRecords)) {
			const repPatterns = getRepPatterns(exerciseRecord);
			for (const reps of util.randomSelector(repPatterns)) {
				yield new Exercise(exerciseRecord as ExerciseRecord, reps);
			}
		}
		return;
	}

	public readonly name: string;
	public readonly reps: number[];
	public readonly totalReps: number;
	public readonly totalSeconds: number;
	public readonly muscleActivity: MuscleActivity = new MuscleActivity();

	constructor(exerciseRecord: ExerciseRecord, reps: number[]) {
		this.name = exerciseRecord.name;
		this.reps = reps;
		this.totalReps = util.sum(this.reps);
		const restSeconds = (this.reps.length - 1) * REST_TIME_S;
		const activeSeconds = this.totalReps * exerciseRecord.secondsPerRep;
		this.totalSeconds = restSeconds + activeSeconds;

		exerciseRecord.activations.forEach(a => {
			this.muscleActivity.set(a.muscle, a.intensityPerRep * this.totalReps);
		});
	}

	public toString(): string {
		return `${this.name} ${this.reps[0]}x${this.reps.length}`;
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
