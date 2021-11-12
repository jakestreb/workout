import GetEndpoint from './base_endpoints/GetEndpoint';
import type Session from '../Session';

export default class GenerateNext extends GetEndpoint {
	constructor() {
		super('/next');
	}

	public async controller(session: Session, query: any): Promise<APIWorkout|null> {
		const { index, hold } = query;
		const workout = await session.getNextWorkout(index, hold || []);
		if (workout) {
			const sets: APIWorkoutSet[] = workout.sets.map(s => ({
				exercise: `${s.exercise}`,
				sets: s.reps.length,
				reps: s.reps[0],
				activity: s.activity.getMap()
			}));
			return {
				sets,
				intensity: workout.intensity,
				activity: workout.activity.getMap(),
				time: workout.time
			};
		}
		return null;
	}
}
