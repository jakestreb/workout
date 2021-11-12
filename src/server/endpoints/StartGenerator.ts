import PostEndpoint from './base_endpoints/PostEndpoint';
import type Session from '../Session';

export default class StartGenerator extends PostEndpoint {
	constructor() {
		super('/start');
	}

	public async controller(session: Session, query: any, body: any): Promise<number> {
		const { name, intensity, timeMinutes } = body;
		return session.startGenerator({ name, intensity, timeMinutes });
	}
}
