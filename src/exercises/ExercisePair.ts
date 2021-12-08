import Exercise from './Exercise';
import MuscleScores from '../muscles/MuscleScores';
import RepsWeight from '../muscles/RepsWeight';
import * as util from '../global/util';

import type WorkoutTarget from '../WorkoutTarget';

export default class ExercisePair extends Exercise {

	public static SWAP_TIME: number = 80;

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

	public get scoresPerRep(): MuscleScores {
		return MuscleScores.combine(super.scoresPerRep, this.second.scoresPerRep);
	}

	public getTime(repsWeight: RepsWeight) {
		const { nSets } = repsWeight;
		return super.getTime(repsWeight) + this.second.getTime(repsWeight)
			+ ((nSets - 1) * 2) * (ExercisePair.SWAP_TIME - Exercise.REST_TIME)
			+ ExercisePair.SWAP_TIME;
	}

	public toString(): string {
		return `${this.name} x ${this.second.name}`;
	}
}

function haveSharedValue(a: string[] = [], b: string[] = []): boolean {
	const set = new Set([...a, ...b]);
	return set.size < a.length + b.length;
}
