import exerciseRecords from '../raw/exercises.json';

export default class ExerciseData {
	private _map: {[name: string]: JSONExercise} = {};

	constructor() {
		exerciseRecords.forEach((rec: JSONExercise) => {
			this._map[rec.name] = rec;
		});
		return this;
	}

	public all(): JSONExercise[] {
		return exerciseRecords;
	}

	public get(name: string): JSONExercise {
		if (!this._map[name]) {
			throw new Error(`Exercise not found: ${name}`);
		}
		return this._map[name];
	}
}
