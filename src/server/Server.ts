import db from '../db';
import api from './endpoints';
import Session from './Session';
import * as bodyParser from 'body-parser';
import express from 'express';

interface SessionStore {
	[userId: number]: Session
}

export default class Server {

	public readonly port: string = process.env.PORT || '3001';

	public app: express.Application = express();
	public sessions: SessionStore = {};

	public async start() {
		await db.init();
		this.app.use((req, res, next) => {
		  	res.header("Access-Control-Allow-Origin", "*");
		  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		  	next();
		});
		this.app.use(bodyParser.json());
		this.app.use(async (req, res, next) => {
			// TODO: Add authentication
			const userId = 1;
			(req as any).session = await this._getSession(userId);
			next();
		});
		for (const str in api) {
			const endpoint = api[str];
			new endpoint().attach(this.app);
		}
		this.app.listen(this.port);
		console.log(`Listening on port ${this.port}`);
	}

	private async _getSession(userId: number) {
		if (!this.sessions[userId]) {
			this.sessions[userId] = await Session.create(userId);
		}
		return this.sessions[userId];
	}
}
