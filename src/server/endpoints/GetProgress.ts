import GetEndpoint from './base_endpoints/GetEndpoint';
import type Session from '../Session';

export default class GetProgress extends GetEndpoint {
	constructor() {
		super('/progress');
	}

	public async controller(session: Session, query: any): Promise<GeneratorProgress[]> {
		return session.getProgress();
	}
}
