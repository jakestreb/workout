import PostEndpoint from './base_endpoints/PostEndpoint';
import db from '../../db';
import type Session from '../Session';

export default class AddUser extends PostEndpoint {
	constructor() {
		super('/user');
	}

	public async controller(session: Session, query: any, body: any): Promise<void> {
		const { name, experience, gender, weight } = body;
		await db.users.add({ name, experience, gender, weight });
	}
}
