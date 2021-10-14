import * as targetRecords from '../data/targets.json';
import LookaheadGenerator from './LookaheadGenerator';
import PhaseGenerator from './PhaseGenerator';
import Workout from '../Workout';
import * as util from '../global/util';

const PATH = './src/generators/gen_workout_process.ts';

export default class WorkoutGenerator extends LookaheadGenerator {

	public phaseGens: PhaseGenerator[] = [];
	public phaseIndex: number = 0;

	constructor({ intensity, timeMinutes }: any) {
		super({ intensity, timeMinutes }, PATH);

		// TODO: Add name picker
		const name = 'chest_day';
		const targetRecord = targetRecords.find(t => t.name === name);
		if (!targetRecord) { throw new Error('Target not found'); }

		const totalWeight = util.sum(targetRecord.phases.map(phase => phase.weight));

		targetRecord.phases.forEach(phase => {
			const phaseTime = timeMinutes * (phase.weight / totalWeight);
			this.phaseGens.push(
				new PhaseGenerator({ muscles: phase.muscles, intensity, timeMinutes: phaseTime })
			);
		});
	}

	public async* generate(): AsyncGenerator<Workout> {
		const gens = this.phaseGens.map(pg => pg.lookaheadGenerate());
		while (true) {
			const vals = await Promise.all(gens.map(async gen => (await gen.next()).value));
			yield Workout.combine(...vals);
		}
	}

	public kill(): void {
		this.phaseGens.map(pg => pg.kill());
	}

	public hold(exercises: Set<string>): void {
		// TODO
	}

	public throw(): void {
		this.phaseGens.map(pg => pg.throw());
	}
}
