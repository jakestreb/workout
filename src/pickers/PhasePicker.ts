import PhaseGenerator from '../generators/PhaseGenerator';
import Picker from './Picker';
import Workout from '../Workout';
import { Result } from '../global/enums';

// TODO: Why is this needed?
interface Target {
	muscles: string[];
	intensity: number;
	timeMinutes: number;
}

export default class PhasePicker extends Picker<Workout> {

	private _phaseTargets: Target[];

	constructor(phaseTargets: Target[]) {
		super();

		this._phaseTargets = phaseTargets;
	}

	public get checks() {
		return [
			() => this._checkLength(),
			() => this._checkRepeatExercises(),
		];
	}

	public get phases(): Workout[] {
		return this.items;
	}

	public buildGenerator(): Generator<Workout> {
		if (this.index < this._phaseTargets.length) {
			return new PhaseGenerator(this._phaseTargets[this.index]).lookaheadGenerate();
		}
		return generateNothing();
	}

	private _checkLength(): Result {
		return this.items.length === this._phaseTargets.length ? Result.Complete : Result.Incomplete;
	}

	private _checkRepeatExercises(): Result {
		const all: string[] = [];
		this.phases.forEach(p => {
			p.sets.forEach(s => {
				all.push(s.exercise.name);
			});
		});
		const unique = new Set(all);
		return unique.size < all.length ? Result.Failed : Result.Complete;
	}
}

function* generateNothing() {
	return
}
