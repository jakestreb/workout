import PostEndpoint from '../PostEndpoint';
import Session from '../Session';

export default class StartGenerator extends PostEndpoint {
	public static call(name: string, intensity: number, timeMinutes: number): Promise<void> {
		return new StartGenerator().call({}, { name, intensity, timeMinutes });
	}

	constructor() {
		super('/start');
	}

	public async controller(session: Session, query: any, body: any): Promise<void> {
		const { name, intensity, timeMinutes } = body;
		await session.startGenerator({ name, intensity, timeMinutes });
	}
}
