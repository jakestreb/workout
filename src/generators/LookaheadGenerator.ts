import * as child from 'child_process';
import Workout from '../Workout';
import WorkoutSet from '../WorkoutSet';
import * as util from '../global/util';
import exerciseFromObject from '../exercises/fromObject';
import * as EventEmitter from 'events';

export default class LookaheadGenerator extends EventEmitter {

	private _buildArg: any;
	private _child: child.ChildProcess;

	private _workouts: Workout[] = [];
	private _filtered: Workout[] = [];
	private _held: Set<string> = new Set();

	private _started: boolean = false;

	constructor(arg: any) {
		super();
		this._buildArg = arg;
	}

	public get generatedCount(): number {
		return this._workouts.length;
	}

	public get filteredCount(): number {
		return this._filtered.length;
	}

	public start(): void {
		if (this._child) {
			return;
		}

		this._child = child.fork('./src/generators/lookahead_process.ts');

		this._child.on('message', (msg) => {
			const sets: WorkoutSet[] = msg.sets.map((s: any) => {
				const exercise = exerciseFromObject(s.exercise);
				return new WorkoutSet(exercise, s.reps);
			});
			const w = new Workout(sets);
			this._workouts.push(w);
			if (this._isFilitered(w)) {
				this._filtered.push(w);
			}
		});

		this._child.on('exit', () => {
			this.emit('done');
		});

		this._child.on('error', (err) => {
			throw err;
		});

		this._child.send(this._buildArg);

		this._started = true;
	}

	public kill(): void {
		this._child.kill();
	}

	public async* generate(): AsyncGenerator<Workout|null> {
		if (!this._started) {
			throw new Error('generate() cannot be called before start()');
		}

		while (true) {
			if (this._workouts.length === 0) {
				// Wait for first workout
				await util.sleep(50);
				continue;
			}
			let val = null;
			if (this._filtered.length > 0) {
				const r = Math.floor(Math.random() * this._filtered.length);
				[val] = this._filtered.splice(r, 1);
			}
			yield val;
		}
	}

	public hold(exercises: Set<string>) {
		this._held = new Set(exercises);
		this._filtered = this._workouts.filter(w => this._isFilitered(w));
	}

	private _isFilitered(w: Workout) {
		const held = new Set(this._held);
		w.sets.forEach(s => { held.delete(`${s.exercise}`); });
		return held.size === 0;
	}
}
