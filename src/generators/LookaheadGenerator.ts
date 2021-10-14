import * as child from 'child_process';
import Workout from '../Workout';
import WorkoutSet from '../WorkoutSet';
import * as util from '../global/util';
import exerciseFromObject from '../exercises/fromObject';

export default abstract class LookaheadGenerator {

	public isDone: boolean = false;

	private _buildArg: any;
	private _path: string;

	private _child: child.ChildProcess;

	private _results: Workout[] = [];
	private _filtered: Workout[] = [];
	private _held: Set<string> = new Set();

	private _started: boolean = false;

	constructor(buildArg: any, path: string) {
		this._buildArg = buildArg;
		this._path = path;
	}

	public get generatedCount(): number {
		return this._results.length;
	}

	public get filteredCount(): number {
		return this._filtered.length;
	}

	public kill(): void {
		this._child.kill();
	}

	public hold(exercises: Set<string>) {
		this._held = new Set(exercises);
		this._filtered = this._results.filter(w => this._isFilitered(w));
	}

	public async* lookaheadGenerate(): AsyncGenerator<Workout|null> {
		if (!this._started) {
			this._start();
		}

		while (true) {
			if (this._results.length === 0) {
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

	private _isFilitered(w: Workout) {
		const held = new Set(this._held);
		w.sets.forEach(s => { held.delete(`${s.exercise}`); });
		return held.size === 0;
	}

	private _start(): void {
		if (this._child) {
			return;
		}

		this._child = child.fork(this._path);

		this._child.on('message', (msg) => {
			const sets: WorkoutSet[] = msg.sets.map((s: any) => {
				const exercise = exerciseFromObject(s.exercise);
				return new WorkoutSet(exercise, s.reps);
			});
			const w = new Workout(sets);
			this._results.push(w);
			if (this._isFilitered(w)) {
				this._filtered.push(w);
			}
		});

		this._child.on('exit', () => {
			this.isDone = true;
		});

		this._child.on('error', (err) => {
			throw err;
		});

		this._child.send(this._buildArg);

		this._started = true;
	}
}
