import Exercise from './Exercise';
import MuscleActivity from '../MuscleActivity';
import WorkoutTarget from '../targets/WorkoutTarget';
import * as util from '../global/util';
import * as records from '../data/records.json';

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

	public static* generator(target: WorkoutTarget, exclude: string[] = []) {
		const viableExercises = target.exerciseRecords
			.filter(e => e.supersetGroups && e.supersetGroups.length > 0);
		for (const recordA of util.weightedSelector(viableExercises)) {
			if (exclude.includes(recordA.name)) {
				continue;
			}
			for (const recordB of util.weightedSelector(viableExercises)) {
				if (recordA.name === recordB.name || exclude.includes(recordB.name)) {
					continue;
				}
				if (!haveSharedValue(recordA.supersetGroups, recordB.supersetGroups)) {
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
			+ ((sets - 1) * 2) * (ExercisePair.swapTime - Exercise.restTime)
			+ ExercisePair.swapTime;
	}

	public getRecords(users: string[]) {
		const recordStrs = users.map(u => {
			const userRecords: { [exercise: string]: number } = (records as any)[u];
			if (!userRecords) { throw new Error(`User ${u} not found`); }
			const first = userRecords[this.name];
			const second = userRecords[this.second.name];
			const val = first || second ? `${first} / ${second} lbs` : '?';
			return `${u} ${val}`;
		});
		return recordStrs.join('\n');
	}

	public toString(): string {
		return `${this.name} x ${this.second.name}`;
	}
}

function haveSharedValue(a: string[] = [], b: string[] = []): boolean {
	const set = new Set([...a, ...b]);
	return set.size < a.length + b.length;
}
