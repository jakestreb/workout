import AddUser from './endpoints/AddUser';
import GenerateWorkout from './endpoints/GenerateWorkout';

import RecordManager from '../data/RecordManager';
import Session from './Session';
import * as express from 'express';

interface SessionStore {
	[userId: number]: Session
}

export default class Server {

	public static port: number = 3000;

	public app: express.Application = express();
	public recordManager: RecordManager;
	public sessions: SessionStore;

	constructor() {
		this.recordManager = new RecordManager();
	}

	public get endpoints() {
		return [
			new AddUser(),
			new GenerateWorkout(),
		];
	}

	public start() {
		this.app.use((req, res, next) => {
			// TODO: Add authentication
			const userId = 1;
			(req as any).session = this._getSession(userId);
			next();
		});
		this.endpoints.forEach(endpoint => { endpoint.attach(this.app); });
		this.app.listen(Server.port);
	}

	private _getSession(userId: number) {
		if (!this.sessions[userId]) {
			this.sessions[userId] = new Session(userId, this.recordManager);
		}
		return this.sessions[userId];
	}
}
