import PostEndpoint from './base_endpoints/PostEndpoint';
import Session from '../Session';

export default class AddUser extends PostEndpoint {
	public static call(name: string, experience: string, primaryFocus: string): Promise<void> {
		return new AddUser().call(null, { name, experience, primaryFocus });
	}

	constructor() {
		super('/user');
	}

	public async controller(session: Session, query: any, body: any): Promise<void> {
		const { name, experience, primaryFocus } = body;
		await session.recordManager.addUser({ name, experience, primaryFocus });
	}
}
