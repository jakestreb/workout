import * as express from 'express';

export default class Server {

	public static port: number = 3000;

	public app: Express.Application = express();

	constructor() {

	}

	public start() {
		this.app.listen(Server.port);
	}
}
