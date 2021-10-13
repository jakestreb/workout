export default abstract class Endpoint {
	constructor(public path: string) {

	}

	public abstract attach(app: Express.Application): void;

	public abstract controller(params: any): void;

	public wrapper(req: Request, res: Response): void {
		console.log(`Called ${this.path}`);
		this.controller(params);
	}
}
