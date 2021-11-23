import Exercise from './Exercise';
import MuscleActivity from '../muscles/MuscleActivity';
import WorkoutTarget from '../targets/WorkoutTarget';
import * as util from '../global/util';

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

	constructor(recordA: JSONExercise, recordB: JSONExercise) {
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

	public toString(): string {
		return `${this.name} x ${this.second.name}`;
	}
}

function haveSharedValue(a: string[] = [], b: string[] = []): boolean {
	const set = new Set([...a, ...b]);
	return set.size < a.length + b.length;
}
