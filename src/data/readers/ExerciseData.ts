import Exercise from '../../exercises/Exercise';
import * as exerciseRecords from '../raw/exercises.json';

export default class ExerciseData {
	private _map: {[name: string]: JSONExercise};

	constructor() {
		exerciseRecords.forEach((rec: JSONExercise) => {
			this._map[rec.name] = rec;
		});
		return this;
	}

	public all(): Exercise[] {
		return exerciseRecords.map(e => new Exercise(e));
	}

	public get(name: string): Exercise {
		return new Exercise(this._map[name]);
	}
}
