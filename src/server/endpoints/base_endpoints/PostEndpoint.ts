import Endpoint from './Endpoint';
import type Session from '../../Session';
import axios from 'axios';
import * as express from 'express';

export default abstract class PostEndpoint extends Endpoint {
	constructor(path: string) {
		super(path);
	}

	public attach(app: express.Application): void {
		app.post(this.path, (req: express.Request, res: express.Response) => this.handler(req, res));
	}

	public async call(query: any, body: any): Promise<void> {
		await axios.post(this.path, body, {
			params: query,
			baseURL: this.baseUrl,
		});
	}

	public abstract controller(session: Session, query: any, body: any): Promise<void>;
}
