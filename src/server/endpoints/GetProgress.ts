import GetEndpoint from './base_endpoints/GetEndpoint';
import type Session from '../Session';

export default class GetProgress extends GetEndpoint {
	public static call(index: number): Promise<GeneratorProgress> {
		return new GetProgress().call();
	}

	constructor() {
		super('/progress');
	}

	public async controller(session: Session, query: any): Promise<GeneratorProgress[]> {
		return session.getProgress();
	}
}
