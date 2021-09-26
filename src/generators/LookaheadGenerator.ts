import * as child from 'child_process';
import Workout from '../Workout';
import BasicGenerator from './BasicGenerator';
import * as util from '../global/util';

export default class LookaheadGenerator extends BasicGenerator {

	private _buildArg: any;
	private _child: child.ChildProcess;
	private _workouts: Workout[] = [];
	private _exited: boolean = false;
	// private _msgCount: number = 0;

	constructor(arg: any) {
		super(arg);
		this._buildArg = arg;
	}

	public async* lookaheadGenerate(): AsyncGenerator<Workout> {
		this._setupChild();

		while (!this._exited || this._workouts.length > 0) {
			if (this._workouts.length === 0) {
				await util.sleep(50);
				continue;
			}
			const r = Math.floor(Math.random() * this._workouts.length);
			const [val] = this._workouts.splice(r, 1);
			yield val;
		}
	}

	private _setupChild() {
		if (this._child) {
			return;
		}

		this._child = child.fork('./src/generators/lookahead_process.ts');

		this._child.on('message', (msg) => {
			this._workouts.push(msg);
			// this._msgCount += 1;
			// if (this._msgCount % 100 === 0) {
			// 	console.log(this._msgCount);
			// }
		});

		this._child.on('exit', () => {
			this._exited = true;
			// console.log('DONE');
		});

		this._child.on('error', (err) => {
			this._exited = true;
			throw err;
		});

		this._child.send(this._buildArg);
	}
}
