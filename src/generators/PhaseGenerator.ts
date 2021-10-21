import ExercisePicker from '../pickers/ExercisePicker';
import LookaheadGenerator from './LookaheadGenerator';
import Workout from '../Workout';
import WorkoutPhaseTarget from '../targets/WorkoutPhaseTarget';
import RepPicker from '../pickers/RepPicker';

const PATH = './src/generators/gen_phase_process.ts';

// TODO: Why is this needed?
interface Target {
	muscles: string[];
	intensity: number;
	timeMinutes: number;
}

export default class PhaseGenerator extends LookaheadGenerator {

	public target: WorkoutPhaseTarget;

	constructor({ muscles, intensity, timeMinutes }: Target) {
		super({ muscles, intensity, timeMinutes }, PATH);
		this.target = new WorkoutPhaseTarget(muscles, intensity, timeMinutes * 60);
	}

	public* generate(): Generator<Workout> {
		const exercisePicker = new ExercisePicker(this.target);

		for (const exercises of exercisePicker.pick()) {
			const repPicker = new RepPicker(exercises, this.target);
			for (const sets of repPicker.pick()) {
				yield new Workout(sets);
				break;
			}
		}
	}

	public throw(): void {
		this.target.throw();
	}
}
