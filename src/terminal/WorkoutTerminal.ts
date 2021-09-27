import ColumnList from './ColumnList';
import Exercise from '../Exercise';
import SelectColumnList from './SelectColumnList';
import Terminal from './Terminal';
import Workout from '../Workout';
import WorkoutSet from '../WorkoutSet';

export default class WorkoutTerminal extends Terminal {

	public workout: Workout;

	public workoutComponent: SelectColumnList;
	public muscleComponent: ColumnList;
	public recordComponent: ColumnList;

	private _locked: Set<string> = new Set();

	constructor(public users: string[]) {
		super();
	}

	public get locked() {
		return Array.from(this._locked);
	}

	public update(w: Workout) {
		this.workout = w;
		this._updateWorkout(w);
		this._updateMuscles(w);
	}

	private _updateWorkout(w: Workout) {
		this.workout = w;
		if (!this.workoutComponent) {
			this.workoutComponent = new SelectColumnList(0.1, 0.2);
			this.add(this.workoutComponent);
			this.workoutComponent.on('select', index => {
				this._toggleLock(this.workout.sets[index]);
				this._updateWorkout(this.workout);
				this.updateDisplay();
			});
			this.workoutComponent.on('hover', index => {
				this._updateRecords(this.workout.sets[index].exercise);
				this.updateDisplay();
			});
		}
		this.workoutComponent.update(w.sets.map(s => {
			const lock = this._isLocked(s) ? '>' : ' ';
			return ` ${lock} ${s}   `;
		}));
	}

	private _updateMuscles(w: Workout) {
		if (!this.muscleComponent) {
			this.muscleComponent = new ColumnList(0.6, 0.2);
			this.add(this.muscleComponent);
		}
		const muscles = `intensity: ${w.intensity.toFixed(1)}\n\n${w.activity}`.split('\n');
		this.muscleComponent.update(muscles);
	}

	private _updateRecords(e: Exercise) {
		if (!this.recordComponent) {
			this.recordComponent = new ColumnList(0.1, 0.5);
			this.add(this.recordComponent);
		}
		this.recordComponent.update(e.getRecords(this.users).split('\n').map(x => `   ${x}   `));
	}

	private _toggleLock(s: WorkoutSet) {
		const name = s.exercise.name;
		if (this._locked.has(name)) {
			this._locked.delete(name);
			return;
		}
		this._locked.add(name);
	}

	private _isLocked(s: WorkoutSet) {
		return this._locked.has(s.exercise.name);
	}
}
