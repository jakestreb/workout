import Workout from '../Workout';
import WorkoutGenerator from '../generators/WorkoutGenerator';

export default class MultiGenerator {

	public workoutGenerators: WorkoutGenerator[];

	private _gens: Generator<Workout|null>[];

	constructor(targets: IWorkoutTarget[]) {
		this.workoutGenerators = targets.map(t => new WorkoutGenerator(t));
		this._gens = this.workoutGenerators.map(wg => wg.lookaheadGenerate());
		this.workoutGenerators.forEach(wg => { wg.start(); });
	}

	public* generate(): Generator<Workout|null, any, number> {
		let index: number = -1;
		let value: Workout|null = null;
		while (true) {
			if (index >= 0) {
				value = this._gens[index].next().value;
			}
			index = yield value;
		}
	}

	public killAll() {
		this.workoutGenerators.map(gen => gen.kill());
	}
}
