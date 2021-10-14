import GetEndpoint from '../GetEndpoint';
import Session from '../Session';

export default class GenerateWorkout extends GetEndpoint {
	constructor() {
		super('/workout');
	}

	public async controller(session: Session, query: any): Promise<Object> {
		const { intensity, timeMinutes } = query;
		const workout = await session.getNextWorkout({ intensity, timeMinutes });
		return workout;
	}
}
