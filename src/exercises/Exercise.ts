import RepsWeight from './RepsWeight';
import MuscleScores from '../muscles/MuscleScores';
import Score from '../muscles/Score';
// import * as util from '../global/util';
import data from '../data';

import type WorkoutTarget from '../WorkoutTarget';

export default class Exercise {

	public static STD_SETS = 4;
	public static FIRST_TIME_WEIGHT_RATIO = 0.5;

	public static REST_TIME = 60;
	public static TRANSITION_TIME = 3 * 60;

	public static STD_BODYWEIGHT_FEMALE = 140;
	public static STD_BODYWEIGHT_MALE = 160;

	public static* generator(target: WorkoutTarget, exclude: string[] = []) {
		for (const exercise of target.possibleExercises) {
			if (!exclude.includes(exercise.name)) {
				yield exercise;
			}
		}
	}

	public readonly name: string;

	private readonly _record: JSONExercise;
	private readonly _scoreFactors: MuscleScores = new MuscleScores();

	constructor(name: string) {
		this.name = name;
		this._record = data.exercises.get(name);
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

	public get standardSets(): number {
		return Exercise.STD_SETS;
	}

	public get standardReps(): number {
		// TODO: Make this a single value in json
		const { endurance, strength } = this._record.reps;
		return Math.floor((endurance + strength) / 2);
	}

	public get repEstimate(): number {
		return this.standardSets * this.standardReps;
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

	public getWeightStandard(gender: DBUser['gender']): number {
		const { isBodyweightExercise, weightStandards } = this._record;
		const bodyweightStandards = {
			male: Exercise.STD_BODYWEIGHT_MALE,
			female: Exercise.STD_BODYWEIGHT_FEMALE,
		};
		const standards = isBodyweightExercise ? bodyweightStandards : weightStandards;
		switch (gender) {
			case 'female':
				return standards.female;
			case 'male':
				return standards.male;
			default:
				return (standards.male + standards.female) / 2;
		}
	}

	public getStandardRepsWeight(gender: DBUser['gender']): RepsWeight {
		return new RepsWeight({
			reps: this.standardReps,
			sets: this.standardSets,
			weight: this.getWeightStandard(gender),
		});
	}

	public getTime(repsWeight: RepsWeight) {
		const { reps, sets } = repsWeight;
		return reps * sets * this._record.secondsPerRep + (sets - 1) * Exercise.REST_TIME;
	}

	public getFocusScores(repsWeight: RepsWeight, user: DBUser): MuscleScores {
		const score = this.getScore(repsWeight, user);

		const muscleScores = new MuscleScores();
		data.muscles.componentNames.forEach(m => {
			muscleScores.set(m, score.multiply(this.muscleScoreFactors.get(m)));
		});

		return muscleScores;
	}

	public getStandardFocusScores(user: DBUser): MuscleScores {
		const standard = this.getStandardRepsWeight(user.gender);
		return this.getFocusScores(standard, user);
	}

	public getScore(repsWeight: RepsWeight, user: DBUser): Score {
		const { reps, sets, weight } = repsWeight;
		const stdReps = this.standardReps;
		const stdWeight = this.getWeightStandard(user.gender);

		const endurance = reps / stdReps;
		return new Score({
			endurance: endurance + (0.25 * endurance * sets),
			strength: weight ? weight / stdWeight : 1,
		});
	}

	public incReps(repsWeight: RepsWeight, factor: number = 1): RepsWeight {
		const { reps, sets, weight } = repsWeight;
		const incremented = Math.round(reps + (this.standardReps * 0.2 * factor));

		return new RepsWeight({
			reps: Math.max(incremented, 1),
			sets,
			weight,
		});
	}

	public incWeight(repsWeight: RepsWeight): RepsWeight {
		return repsWeight.incWeight(1);
	}

	public getFirstTryRepsWeight(user: DBUser): RepsWeight {
		const standardWeight = this.getWeightStandard(user.gender);
		const ratio = Exercise.FIRST_TIME_WEIGHT_RATIO;
		return new RepsWeight(
			{
				reps: this.standardReps,
				sets: this.standardSets,
				weight: standardWeight ? standardWeight * ratio : null,
			}
		);
	}

	public toString(): string {
		return `${this.name}`;
	}
}
