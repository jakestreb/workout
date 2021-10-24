import MuscleActivity from '../MuscleActivity';
import SelectTable from './SelectTable';
import Table from './Table';
import Terminal from './Terminal';
import Workout from '../Workout';
import WorkoutSet from '../WorkoutSet';
import api from '../server/endpoints';
import Server from '../server/Server';
import * as util from '../global/util';

export default class WorkoutTerminal extends Terminal {

	public users: string[];

	public workout: Workout;
	public hovered: WorkoutSet;

	public progress: GeneratorProgress;

	public genIndex: number = 0;

	public workoutComponent: SelectTable;
	public dataComponent: Table;

	private _target: any;

	constructor(target: any, users: string[]) {
		super();
		this.users = users;
		this._target = target;
	}

	public async start() {
		new Server().start();

		await api.StartGenerator.call(this._target.name, this._target.intensity, this._target.timeMinutes);
		this._pollProgress();

		process.stdin.setRawMode!(true);
		process.stdin.resume();
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', async (key) => {
			if (key === '\u0003') { // ctrl-c
				try {
					await api.StopGenerator.call();
					this.kill();
				} catch (err) {
					console.error(err);
				} finally {
					process.exit();
				}
			} else if (key === 'g') {
				const workout = await api.GenerateNext.call(this.genIndex, this.locked);
				if (workout) {
					this.update(workout);
				}
			}
		});

		util.forever(() => {
			if (this.workout) {
				this._updateData();
			}
		}, 500);

		console.log('> "g" to generate');
	}

	public get locked(): string[] {
		return this.workoutComponent ? Array.from(this.workoutComponent.selectedKeys) : [];
	}

	public update(w: Workout) {
		this.workout = w;
		this._updateWorkout();
		this._updateData();
	}

	private _updateWorkout() {
		if (!this.workoutComponent) {
			this.workoutComponent = new SelectTable(0.1, 0.1);
			this.add(this.workoutComponent);
			this.workoutComponent.on('select', index => {
				this._updateData();
			});
			this.workoutComponent.on('hover', index => {
				this.hovered = this.workout.sets[index];
				this._updateData();
			});
		}
		this.workoutComponent.update(this.workout.sets.map((s, i) => [`${s.exercise}`, s.repString()]));
	}

	private _updateData() {
		if (!this.dataComponent) {
			this.dataComponent = new Table(0.55, 0.1);
			this.add(this.dataComponent);
		}
		this.dataComponent.update([
			...this._basicData,
			[],
			...this._muscleData,
			[],
			...this._recordData,
			[],
			...this._generatorData,
		]);
	}

	private async _pollProgress() {
		this.progress = await api.GetProgress.call(this.genIndex);
		setTimeout(() => this._pollProgress(), 100);
	}

	private get _basicData(): string[][] {
		const w = this.workout;
		return [
			['time', util.timeString(w.time)],
			['intensity', w.intensity.toFixed(1)]
		];
	}

	private get _muscleData(): string[][] {
		const w = this.workout;
		const selected = MuscleActivity.combine(...this.workout.sets
			.filter(s => this.locked.includes(`${s.exercise}`))
			.map(s => s.activity));
		const compareStrs = w.activity.compareString(selected).split('\n');
		return compareStrs.map(s => s.split(' '));
	}

	private get _recordData(): string[][] {
		const e = this.hovered.exercise;
		const recordRows = e.getRecords(this.users).split('\n');
		return recordRows.map(row => [row.split(' ')[0], row.split(' ').slice(1).join(' ')]);
	}

	private get _generatorData(): string[][] {
		const p = this.progress;
		return [
			[`generated${p.isDone ? ' all' : ''}`, `${p.generated}`],
			['remaining', `${p.filtered}`]
		];
	}
}
