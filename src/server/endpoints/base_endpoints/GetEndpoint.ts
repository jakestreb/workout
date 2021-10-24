import Endpoint from './Endpoint';
import type Session from '../../Session';
import axios from 'axios';
import * as express from 'express';
import * as qs from 'qs';

export default abstract class GetEndpoint extends Endpoint {
	constructor(path: string) {
		super(path);
	}

	public attach(app: express.Application): void {
		app.get(this.path, (req: express.Request, res: express.Response) => this.handler(req, res));
	}

	public async call(query: any): Promise<any> {
		const result = await axios.get(this.path, {
			params: query,
			baseURL: this.baseUrl,
			paramsSerializer: params => qs.stringify(params),
		});
		return result.data;
	}

	public controller(session: Session, query: any, body: any): Promise<Object> {
		return Promise.resolve({});
	}
}
