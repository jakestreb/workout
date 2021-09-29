import MuscleActivity from '../MuscleActivity';
import SelectTable from './SelectTable';
import Table from './Table';
import Terminal from './Terminal';
import Workout from '../Workout';
import WorkoutSet from '../WorkoutSet';
import * as util from '../global/util';

export default class WorkoutTerminal extends Terminal {

	public workout: Workout;
	public hovered: WorkoutSet;

	public totalGenerated: number;
	public remainingGenerated: number;
	public isDone: boolean = false;

	public workoutComponent: SelectTable;
	public dataComponent: Table;

	constructor(public users: string[]) {
		super();
	}

	public get locked(): Set<string> {
		return this.workoutComponent ? this.workoutComponent.selectedKeys : new Set();
	}

	public update(w: Workout) {
		this.workout = w;
		this._updateWorkout();
		this._updateData();
	}

	public updateGeneratedCounts(total: number, filtered: number, isDone: boolean): void {
		this.totalGenerated = total;
		this.remainingGenerated = filtered;
		this.isDone = isDone;
		this._updateData();
	}

	private _updateWorkout() {
		if (!this.workoutComponent) {
			this.workoutComponent = new SelectTable(0.1, 0.1);
			this.add(this.workoutComponent);
			this.workoutComponent.on('select', index => {
				this.emit('lock', this.locked);
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
		return [
			[`generated${this.isDone ? ' all' : ''}`, `${this.totalGenerated}`],
			['remaining', `${this.remainingGenerated}`]
		];
	}
}
