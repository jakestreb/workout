import * as targetRecords from '../data/targets.json';
import LookaheadGenerator from './LookaheadGenerator';
import PhasePicker from '../pickers/PhasePicker';
import Workout from '../Workout';
import * as util from '../global/util';

const PATH = './src/generators/gen_workout_process.ts';

export default class WorkoutGenerator extends LookaheadGenerator {

	private _phaseTargets: Target[];

	constructor({ name, intensity, timeMinutes }: any) {
		super({ name, intensity, timeMinutes }, PATH);

		// TODO: Add name picker
		const targetRecord  = targetRecords.find(t => t.name === name);
		if (!targetRecord) { throw new Error('Target not found'); }

		const totalWeight = util.sum(targetRecord.phases.map(phase => phase.weight));

		this._phaseTargets = targetRecord.phases.map(phase => {
			const phaseTime = timeMinutes * (phase.weight / totalWeight);
			return { muscles: phase.muscles, intensity, timeMinutes: phaseTime };
		});
	}

	public async* generate(): AsyncGenerator<Workout> {
		const phasePicker = new PhasePicker(this._phaseTargets);

		for (const phases of phasePicker.pick()) {
			yield Workout.combine(...phases);
			break;
		}
	}

	public kill(): void {
		// TODO
	}

	public hold(exercises: Set<string>): void {
		// TODO
	}

	public throw(): void {
		// TODO
	}
}
