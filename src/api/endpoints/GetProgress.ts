import GetEndpoint from '../GetEndpoint';
import Session from '../Session';

export default class GetProgress extends GetEndpoint {
	public static call(): Promise<GeneratorProgress> {
		return new GetProgress().call({});
	}

	constructor() {
		super('/progress');
	}

	public async controller(session: Session, query: any): Promise<GeneratorProgress> {
		return session.getProgress();
	}
}
