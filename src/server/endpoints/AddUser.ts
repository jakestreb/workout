import PostEndpoint from './base_endpoints/PostEndpoint';
import db from '../../db/db';
import type Session from '../Session';

export default class AddUser extends PostEndpoint {
	public static call(name: string, experience: string, primaryFocus: string): Promise<void> {
		return new AddUser().call(null, { name, experience, primaryFocus });
	}

	constructor() {
		super('/user');
	}

	public async controller(session: Session, query: any, body: any): Promise<void> {
		const { name, experience, primaryFocus, gender } = body;
		await db.users.add({ name, experience, primary_focus: primaryFocus, gender });
	}
}
