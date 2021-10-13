import * as targetRecords from '../data/new_targets.json';
import PhaseGenerator from './PhaseGenerator';
import Workout from '../Workout';
import * as util from '../global/util';

export default class WorkoutGenerator {

	public phaseGens: PhaseGenerator[] = [];
	public phaseIndex: number = 0;

	constructor({ name, intensity, timeMinutes }: any) {
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
