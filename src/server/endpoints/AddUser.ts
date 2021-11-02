import PostEndpoint from './base_endpoints/PostEndpoint';
import Users from '../../db/Users';
import type Session from '../Session';

export default class AddUser extends PostEndpoint {
	public static call(name: string, experience: string, primaryFocus: string): Promise<void> {
		return new AddUser().call(null, { name, experience, primaryFocus });
	}

	constructor() {
		super('/user');
	}

	public async controller(session: Session, query: any, body: any): Promise<void> {
		const { name, experience, primaryFocus } = body;
		await Users.add({ name, experience, primaryFocus });
	}
}
