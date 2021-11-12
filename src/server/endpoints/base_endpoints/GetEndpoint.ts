import Endpoint from './Endpoint';
import type Session from '../../Session';
import * as express from 'express';

export default abstract class GetEndpoint extends Endpoint {
	constructor(path: string) {
		super(path);
	}

	public attach(app: express.Application): void {
		app.get(this.path, (req: express.Request, res: express.Response) => this.handler(req, res));
	}

	public controller(session: Session, query: any, body: any): Promise<any> {
		return Promise.resolve({});
	}
}
