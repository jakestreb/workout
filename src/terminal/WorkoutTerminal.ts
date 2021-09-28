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

	public workoutComponent: SelectTable;
	public muscleComponent: Table;
	public recordComponent: Table;
	public generatedComponent: Table;

	constructor(public users: string[]) {
		super();
	}

	public get locked(): Set<string> {
		return this.workoutComponent ? this.workoutComponent.selectedKeys : new Set();
	}

	public update(w: Workout) {
		this.workout = w;
		this._updateWorkout();
		this._updateMuscles();
	}

	public updateGeneratedCounts(total: number, filtered: number): void {
		if (!this.generatedComponent) {
			this.generatedComponent = new Table(0.8, 0.85);
			this.add(this.generatedComponent);
		}
		this.generatedComponent.update([
			['generated:', `${total}`],
			['remaining:', `${filtered}`]
		]);
	}

	private _updateWorkout() {
		if (!this.workoutComponent) {
			this.workoutComponent = new SelectTable(0.1, 0.15);
			this.add(this.workoutComponent);
			this.workoutComponent.on('select', index => {
				this.emit('lock', this.locked);
				this._updateMuscles();
			});
			this.workoutComponent.on('hover', index => {
				this.hovered = this.workout.sets[index];
				this._updateRecords();
				this._updateMuscles();
			});
		}
		this.workoutComponent.update(this.workout.sets.map((s, i) => [`${s.exercise}`, s.repString()]));
	}

	private _updateMuscles() {
		if (!this.muscleComponent) {
			this.muscleComponent = new Table(0.5, 0.15);
			this.add(this.muscleComponent);
		}
		const w = this.workout;
		const selected = MuscleActivity.combine(...this.workout.sets
			.filter(s => this.locked.has(`${s.exercise}`))
			.map(s => s.activity));
		const compareStrs = w.activity.compareString(selected).split('\n');
		const muscles = [
			['time:', util.timeString(w.time)],
			['intensity:', w.intensity.toFixed(1)],
			[],
			...compareStrs.map(s => s.split(' '))
		];
		this.muscleComponent.update(muscles);
	}

	private _updateRecords() {
		if (!this.recordComponent) {
			this.recordComponent = new Table(0.1, 0.45);
			this.add(this.recordComponent);
		}
		const e = this.hovered.exercise;
		const recordRows = e.getRecords(this.users).split('\n');
		const records = recordRows.map(row => [row.split(' ')[0], row.split(' ').slice(1).join(' ')]);
		this.recordComponent.update(records);
	}
}
