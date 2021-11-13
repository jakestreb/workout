import Exercise from './Exercise';
import ExercisePair from './ExercisePair';
import data from '../data';

export default function fromJsonObject(obj: any): Exercise|ExercisePair {
	const record = data.exercises.get(obj.name);
	if (obj.second) {
		const secondRecord = data.exercises.get(obj.second.name);
		return new ExercisePair(record as any, secondRecord as any);
	}
	return new Exercise(record as any);
}
