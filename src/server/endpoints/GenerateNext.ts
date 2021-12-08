import GetEndpoint from './base_endpoints/GetEndpoint';
import type Session from '../Session';

export default class GenerateNext extends GetEndpoint {
	constructor() {
		super('/next');
	}

	public async controller(session: Session, query: any): Promise<IWorkout|null> {
		const { user } = session;
		const { index, hold } = query;
		const workout = await session.getNextWorkout(index, hold || []);
		if (workout) {
			const sets: IWorkoutSet[] = workout.sets.map(s => ({
				exercise: `${s.exercise}`,
				sets: s.repsWeight.nSets,
				reps: s.repsWeight.nReps,
				muscleScores: s.getScores(user).getMap(),
			}));
			return {
				sets,
				muscleScores: workout.getScores(user).getMap(),
				time: workout.time
			};
		}
		return null;
	}
}
