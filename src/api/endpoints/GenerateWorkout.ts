import GetEndpoint from '../GetEndpoint';
import Session from '../Session';

export default class GenerateWorkout extends GetEndpoint {
	constructor() {
		super('/workout');
	}

	public async controller(session: Session, query: any): Promise<Object> {
		const { name, intensity, timeMinutes } = query;
		const workout = await session.getNextWorkout({ name, intensity, timeMinutes });
		return workout;
	}

	public call(name: string, intensity: number, timeMinutes: number) {
		return this.makeRequest({ name, intensity, timeMinutes });
	}
}
