import type * as exerciseRecords from '../data/exercises.json';
import MuscleActivity from '../MuscleActivity';
import type WorkoutTarget from '../targets/WorkoutTarget';
import * as util from '../global/util';
import * as records from '../data/records.json';

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

	private readonly _record: typeof exerciseRecords[0];

	constructor(exerciseRec: typeof exerciseRecords[0]) {
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

	public getWeightStandard(gender: DBUser['gender']): number|null {
		const record = this._record;
		if (record.isBodyweightExercise) {
			return null;
		}
		switch (gender) {
			case 'female':
				return record.femaleWeightRatio!;
			case 'male':
				return record.maleWeightRatio!;
			default:
				return (record.maleWeightRatio! + record.femaleWeightRatio!) / 2;
		}
	}

	public getTime(sets: number, reps: number) {
		return reps * sets * this._secondsPerRep + (sets - 1) * Exercise.restTime;
	}

	public getRecords(users: string[]): string {
		const recordStrs = users.map(u => {
			const userRecords: { [exercise: string]: number } = (records as any)[u];
			if (!userRecords) { throw new Error(`User ${u} not found`); }
			const val = userRecords[this.name] ? `${userRecords[this.name]} lbs` : '?';
			return `${u} ${val}`;
		});
		return recordStrs.join('\n');
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
