import PostEndpoint from './base_endpoints/PostEndpoint';
import type Session from '../Session';

export default class StopGenerator extends PostEndpoint {
	public static call(): Promise<void> {
		return new StopGenerator().call({}, {});
	}

	constructor() {
		super('/stop');
	}

	public async controller(session: Session, query: any, body: any): Promise<void> {
		await session.stopGenerator();
	}
}
