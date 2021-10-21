import Exercise from './Exercise';
import ExercisePair from './ExercisePair';
import * as exerciseRecords from '../data/exercises.json';

export default function fromJsonObject(obj: any): Exercise|ExercisePair {
	const record = exerciseRecords.find(rec => rec.name === obj.name);
	if (obj.second) {
		const secondRecord = exerciseRecords.find(rec => rec.name === obj.second.name);
		return new ExercisePair(record as any, secondRecord as any);
	}
	return new Exercise(record as any);
}
