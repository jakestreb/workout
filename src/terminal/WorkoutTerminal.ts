import ColumnList from './ColumnList';
import SelectColumnList from './SelectColumnList';
import Terminal from './Terminal';
import MuscleActivity from '../MuscleActivity';
import Workout from '../Workout';
import WorkoutSet from '../WorkoutSet';

export default class WorkoutTerminal extends Terminal {

	public workout: Workout;
	public activity: MuscleActivity;

	public workoutComponent: SelectColumnList;
	public muscleComponent: ColumnList;

	private _locked: Set<string> = new Set();

	public showMuscles(a: MuscleActivity) {
		this.activity = a;
		if (!this.muscleComponent) {
			this.muscleComponent = new ColumnList(0.6, 0.2);
			this.add(this.muscleComponent);
		}
		this.muscleComponent.update(`${a}`.split('\n'));
	}

	public showWorkout(w: Workout) {
		this.workout = w;
		if (!this.workoutComponent) {
			this.workoutComponent = new SelectColumnList(0.1, 0.2);
			this.add(this.workoutComponent);
			this.workoutComponent.on('select', index => {
				this._toggleLock(this.workout.sets[index]);
				this.showWorkout(this.workout);
				this.updateDisplay();
			});
		}
		this.workoutComponent.update(w.sets.map(s => {
			const lock = this._isLocked(s) ? '>' : ' ';
			return `${lock} ${s}`;
		}));
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
