import PostEndpoint from '../PostEndpoint';
import Session from '../Session';

export default class AddUser extends PostEndpoint {
	constructor() {
		super('/user');
	}

	public async controller(session: Session, query: any, body: any): Promise<void> {
		const { name, experience, primaryFocus } = body;
		await session.recordManager.addUser({ name, experience, primaryFocus });
	}

	public call(name: string, experience: string, primaryFocus: string) {
		return this.makeRequest(null, { name, experience, primaryFocus });
	}
}
