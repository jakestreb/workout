import GetEndpoint from './base_endpoints/GetEndpoint';
import type Session from '../Session';
import Workout from '../../Workout';

export default class GenerateNext extends GetEndpoint {
	public static async call(index: number, hold: string[]): Promise<Workout|null> {
		const result = await new GenerateNext().call({ index, hold });
		const workout: Workout|null = result ? Workout.fromJsonObject(result) : null;
		return workout;
	}

	constructor() {
		super('/next');
	}

	public async controller(session: Session, query: any): Promise<Workout> {
		const { index, hold } = query;
		const workout = await session.getNextWorkout(index, hold || []);
		return workout;
	}
}
