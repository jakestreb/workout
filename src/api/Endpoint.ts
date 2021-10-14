import * as express from 'express';
import Session from './Session';

export default abstract class Endpoint {
	constructor(public path: string) {

	}

	public abstract attach(app: express.Application): void;

	public abstract controller(session: Session, query: any, body: any): Promise<any>;

	public async handler(req: express.Request, res: express.Response): Promise<void> {
		console.log(`Called: ${this.path}`, req.query, req.body);
		try {
			const result = await this.controller((req as any).session, req.query, req.body);
			res.status(200).json(result);
		} catch (err) {
			console.error(`Error on call: ${this.path}`, err);
			res.status(500).send(err);
		}
	}
}
