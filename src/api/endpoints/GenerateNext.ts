import GetEndpoint from '../GetEndpoint';
import Session from '../Session';
import Workout from '../../Workout';

export default class GenerateNext extends GetEndpoint {
	public static async call(hold: string[]): Promise<Workout> {
		const result = await new GenerateNext().call({ hold });
		const workout = Workout.fromJsonObject(result);
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
