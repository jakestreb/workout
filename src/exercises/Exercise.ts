import MuscleActivity from '../muscles/MuscleActivity';
import type WorkoutTarget from '../targets/WorkoutTarget';
import * as util from '../global/util';

export default class Exercise {
	public static* generator(target: WorkoutTarget, exclude: string[] = []) {
		for (const exerciseRecord of target.exerciseRecords) {
			if (!exclude.includes(exerciseRecord.name)) {
				yield new Exercise(exerciseRecord);
			}
		}
	}

	public static restTime: number = 60;
	public static transitionTime: number = 3 * 60;

	public readonly name: string;

	private readonly _secondsPerRep: number;
	private readonly _activityPerRep: MuscleActivity = new MuscleActivity();
	private readonly _possibleSets: number[];
	private readonly _possibleReps: number[];

	private readonly _record: JSONExercise;

	constructor(exerciseRec: JSONExercise) {
		this.name = exerciseRec.name;

		this._secondsPerRep = exerciseRec.secondsPerRep;
		this._possibleSets = exerciseRec.sets;
		this._possibleReps = exerciseRec.reps;

		exerciseRec.activations.forEach(a => {
			this._activityPerRep.set(a.muscle, a.intensityPerRep);
		});

		this._record = exerciseRec;
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
		const avgSets = this._possibleSets[this._possibleSets.length / 2]
		const avgReps = this._possibleReps[this._possibleReps.length / 2]
		return new Array(avgSets).fill(avgReps);
	}

	public get timeEstimate(): number {
		const avgSets = util.avg(this.possibleSets);
		return avgSets * util.avg(this.possibleReps) * this._secondsPerRep + (avgSets - 1) * Exercise.restTime;
	}

	public get repEstimate(): number {
		return util.avg(this.possibleSets) * util.avg(this.possibleReps);
	}

	public get activityPerRep(): MuscleActivity {
		return this._activityPerRep;
	}

	public get sortIndex(): number {
		return -this._activityPerRep.total * this.repEstimate;
	}

	public get skills() {
		return this._record.skills;
	}

	public get muscles(): string[] {
		return this.activityPerRep.keys;
	}

	public get weight(): number {
		return this._record.weight;
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

	public getTime(sets: number, reps: number) {
		return reps * sets * this._secondsPerRep + (sets - 1) * Exercise.restTime;
	}

	public* generateRepPatterns(): Generator<number[]> {
		for (const reps of util.randomSelector(getRepPatterns(this.possibleSets, this.possibleReps))) {
			yield reps;
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
