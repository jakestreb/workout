import MuscleActivity from '../MuscleActivity';
import SelectTable from './SelectTable';
import Table from './Table';
import Terminal from './Terminal';
import Workout from '../Workout';
import WorkoutSet from '../WorkoutSet';
import WorkoutGenerator from '../generators/WorkoutGenerator';
import * as util from '../global/util';

export default class WorkoutTerminal extends Terminal {

	public workout: Workout;
	public hovered: WorkoutSet;

	public totalGenerated: number;
	public remainingGenerated: number;
	public isDone: boolean = false;

	public workoutComponent: SelectTable;
	public dataComponent: Table;

	constructor(public workoutGenerator: WorkoutGenerator, public users: string[]) {
		super();
	}

	public start() {
		const gen = this.workoutGenerator.generate();

		process.stdin.setRawMode!(true);
		process.stdin.resume();
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', async (key) => {
			if (key === '\u0003') { // ctrl-c
				this.workoutGenerator.kill();
				this.kill();
				process.exit();
			} else if (key === 'g') {
				const curr = await gen.next();
				if (curr.done) {
					process.exit();
				}
				if (curr.value) {
					this.update(curr.value);
				}
			}
		});

		util.forever(() => {
			this._updateData();
		}, 500);

		console.log('> "g" to generate');
	}

	public get locked(): Set<string> {
		return this.workoutComponent ? this.workoutComponent.selectedKeys : new Set();
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
				this.workoutGenerator.hold(this.locked);
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
			.filter(s => this.locked.has(`${s.exercise}`))
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
		const wg = this.workoutGenerator;
		return [
			[`generated${wg.isDone ? ' all' : ''}`, `${wg.generatedCount}`],
			['remaining', `${wg.filteredCount}`]
		];
	}
}
