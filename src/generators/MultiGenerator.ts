import targetRecords from '../data/targets.json';
import Workout from '../Workout';
import WorkoutGenerator from '../generators/WorkoutGenerator';
import * as util from '../global/util';

// TODO: Why is this needed?
interface Target {
	muscles: string[];
	intensity: number;
	timeMinutes: number;
}

export default class MultiGenerator {

	public workoutGenerators: WorkoutGenerator[];

	private _targets: Target[];
	private _gens: Generator<Workout|null>[];

	constructor({ name, intensity, timeMinutes }: any) {
		// TODO: Add name picker
		const targetRecord  = targetRecords.find(t => t.name === name);
		if (!targetRecord) { throw new Error('Target not found'); }

		const totalWeight = util.sum(targetRecord.phases.map(phase => phase.weight));

		this._targets = targetRecord.phases.map(phase => {
			const phaseTime = timeMinutes * (phase.weight / totalWeight);
			return { muscles: phase.muscles, intensity, timeMinutes: phaseTime };
		});

		this.workoutGenerators = this._targets.map(t => new WorkoutGenerator(t));
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
