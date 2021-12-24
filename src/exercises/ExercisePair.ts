import RepsWeight from './RepsWeight';
import Exercise from './Exercise';
import MuscleScores from '../muscles/MuscleScores';
import * as util from '../global/util';

import type WorkoutTarget from '../WorkoutTarget';

export default class ExercisePair extends Exercise {

	public static SWAP_TIME: number = 80;

	public static* generator(target: WorkoutTarget, exclude: string[] = []) {
		const viableExercises = target.possibleExercises
			.filter(e => e.supersetGroups && e.supersetGroups.length > 0);
		for (const exerciseA of util.weightedSelector(viableExercises)) {
			if (exclude.includes(exerciseA.name)) {
				continue;
			}
			for (const exerciseB of util.weightedSelector(viableExercises)) {
				if (exerciseA.name === exerciseB.name || exclude.includes(exerciseB.name)) {
					continue;
				}
				if (!haveSharedValue(exerciseA.supersetGroups, exerciseB.supersetGroups)) {
					continue;
				}
				const pair = new ExercisePair(exerciseA.name, exerciseB.name);
				if (pair.sortIndex <= pair.second.sortIndex) {
					yield pair;
				}
			}
		}
	}

	public second: Exercise;

	constructor(nameA: string, nameB: string) {
		super(nameA);
		this.second = new Exercise(nameB);
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

	public get muscleScoreFactors(): MuscleScores {
		return MuscleScores.combine(super.muscleScoreFactors, this.second.muscleScoreFactors);
	}

	public getTime(repsWeight: RepsWeight) {
		const { sets } = repsWeight;
		return super.getTime(repsWeight) + this.second.getTime(repsWeight)
			+ ((sets - 1) * 2) * (ExercisePair.SWAP_TIME - Exercise.REST_TIME)
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
