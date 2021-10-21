import GetEndpoint from '../GetEndpoint';
import Session from '../Session';
import Workout from '../../Workout';

export default class GenerateNext extends GetEndpoint {
	public static async call(hold: string[]): Promise<Workout|null> {
		const result = await new GenerateNext().call({ hold });
		const workout: Workout|null = result ? Workout.fromJsonObject(result) : null;
		return workout;
	}

	constructor() {
		super('/next');
	}

	public async controller(session: Session, query: any): Promise<Workout> {
		const { hold } = query;
		const workout = await session.getNextWorkout(hold);
		return workout;
	}
}
