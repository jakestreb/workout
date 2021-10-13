import Endpoint from './Endpoint';

export default abstract class GetEndpoint extends Endpoint {
	constructor(public path: string) {
		super(path);
	}

	public attach(app: Express.Application): void {
		app.get(this.path, (req: Request, res: Response) => this.wrapper(req, res));
	}
}
