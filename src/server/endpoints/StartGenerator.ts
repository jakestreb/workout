import PostEndpoint from './base_endpoints/PostEndpoint';
import type Session from '../Session';

export default class StartGenerator extends PostEndpoint {
	constructor() {
		super('/start');
	}

	public async controller(session: Session, query: any, body: any): Promise<number> {
		const { name, difficulty, timeMinutes } = body;
		return session.startGenerator(name, difficulty, timeMinutes);
	}
}
