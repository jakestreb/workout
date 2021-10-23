import GetEndpoint from '../GetEndpoint';
import Session from '../Session';

export default class GetProgress extends GetEndpoint {
	public static call(index: number): Promise<GeneratorProgress> {
		return new GetProgress().call({ index });
	}

	constructor() {
		super('/progress');
	}

	public async controller(session: Session, query: any): Promise<GeneratorProgress> {
		return session.getProgress(query.index);
	}
}
