import Endpoint from './Endpoint';

export default abstract class PostEndpoint extends Endpoint {
	constructor(public path: string) {
		super(path);
	}

	public attach(app: Express.Application): void {
		app.post(this.path, (req: Request, res: Response) => this.wrapper(req, res));
	}
}
