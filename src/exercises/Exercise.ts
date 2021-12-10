import RepsWeight from './RepsWeight';
import MuscleScores from '../muscles/MuscleScores';
import Score from '../muscles/Score';
import * as util from '../global/util';
import data from '../data';

import type WorkoutTarget from '../WorkoutTarget';

export default class Exercise {
	public static SKILL_BLEED_FACTOR = 0.2;

	public static FIRST_TIME_WEIGHT_RATIO = 0.5;

	public static REST_TIME: number = 60;
	public static TRANSITION_TIME: number = 3 * 60;

	public static* generator(target: WorkoutTarget, exclude: string[] = []) {
		for (const exercise of target.possibleExercises) {
			if (!exclude.includes(exercise.name)) {
				yield exercise;
			}
		}
	}


	public readonly name: string;

	private readonly _secondsPerRep: number;
	private readonly _scoreFactors: MuscleScores = new MuscleScores();
	private readonly _possibleSets: number[];
	private readonly _possibleReps: number[];

	private readonly _record: JSONExercise;

	constructor(name: string) {
		this.name = name;

		this._record = data.exercises.get(name);

		this._secondsPerRep = this._record.secondsPerRep;
		this._possibleSets = this._record.sets;
		this._possibleReps = this._record.reps;

		this._record.activations.forEach(a => {
			this._scoreFactors.set(a.muscle,
				new Score({
					endurance: a.activity,
					strength: a.activity,
				})
			);
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

	public get standardReps(): number[] {
		const avgSets = this.possibleSets[Math.floor(this.possibleSets.length / 2)];
		const avgReps = this.possibleReps[Math.floor(this.possibleReps.length / 2)];
		return new Array(avgSets).fill(avgReps);
	}

	// TODO: Instead, use single standard reps value in exercise records
	public get repEstimate(): number {
		return util.avg(this.possibleSets) * util.avg(this.possibleReps);
	}

	public get muscleScoreFactors(): MuscleScores {
		return this._scoreFactors;
	}

	public get sortIndex(): number {
		return -this._scoreFactors.total * this.repEstimate;
	}

	public get muscles(): string[] {
		return this.muscleScoreFactors.keys;
	}

	public get weight(): number {
		return this._record.weight;
	}

	public get supersetGroups(): string[] {
		return this._record.supersetGroups;
	}

	public getWeightStandard(gender: DBUser['gender']): number|null {
		const record = this._record;
		if (record.isBodyweightExercise) {
			return null;
		}
		switch (gender) {
			case 'female':
				return record.weightStandards.female;
			case 'male':
				return record.weightStandards.male;
			default:
				return (record.weightStandards.male + record.weightStandards.female) / 2;
		}
	}

	public getTime(repsWeight: RepsWeight) {
		const { nReps, nSets } = repsWeight;
		return nReps * nSets * this._secondsPerRep + (nSets - 1) * Exercise.REST_TIME;
	}

	public getFocusScores(repsWeight: RepsWeight, user: DBUser): MuscleScores {
		const score = this.getScore(repsWeight, user);

		const muscleScores = new MuscleScores();
		data.muscles.componentNames.forEach(m => {
			muscleScores.set(m, score.multiply(this.muscleScoreFactors.get(m)));
		});

		return muscleScores;
	}

	public getScore(repsWeight: RepsWeight, user: DBUser): Score {
		const { nReps, nSets } = repsWeight;
		const weight = repsWeight.weight || user.weight;
		const standardWeight = this.getWeightStandard(user.gender);
		const weightFactor = standardWeight ? (weight / standardWeight) : 1;

		const repFactor = nReps / this.standardReps[0];
		const totalRepFactor = (nReps * nSets) / this.repEstimate;

		const enduranceScore = util.avg([repFactor, totalRepFactor]);
		const strengthScore = weightFactor;

		const factor = Exercise.SKILL_BLEED_FACTOR;

		return new Score({
			endurance: (1 - factor) * enduranceScore + factor * strengthScore,
			strength: (1 - factor) * strengthScore + factor * enduranceScore,
		});
	}

	public getFirstTryRepsWeight(user: DBUser): RepsWeight {
		const standardWeight = this.getWeightStandard(user.gender);
		const ratio = Exercise.FIRST_TIME_WEIGHT_RATIO;
		return new RepsWeight({
			reps: this.standardReps,
			weight: standardWeight ? standardWeight * ratio : null,
		});
	}

	public toString(): string {
		return `${this.name}`;
	}
}
