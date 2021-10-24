import api from './endpoints';
import RecordManager from '../data/RecordManager';
import Session from './Session';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

interface SessionStore {
	[userId: number]: Session
}

export default class Server {

	public readonly port: number = 3001;

	public app: express.Application = express();
	public recordManager: RecordManager;
	public sessions: SessionStore = {};

	constructor() {
		this.recordManager = new RecordManager();
	}
	public start() {
		this.app.use(cors());
		this.app.use(bodyParser.json());
		this.app.use((req, res, next) => {
			// TODO: Add authentication
			const userId = 1;
			(req as any).session = this._getSession(userId);
			next();
		});
		for (const str in api) {
			const endpoint = api[str];
			new endpoint().attach(this.app);
		}
		this.app.listen(this.port);
		console.log(`Listening on port ${this.port}`);
	}

	private _getSession(userId: number) {
		if (!this.sessions[userId]) {
			this.sessions[userId] = new Session(userId, this.recordManager);
		}
		return this.sessions[userId];
	}
}
