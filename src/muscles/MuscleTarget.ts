import MuscleScores from '../muscles/MuscleScores';

export default class MuscleTarget {

	private _minScores: MuscleScores;

	// Sets contain muscle names (no groups)
	private readonly _added: Set<string> = new Set();

	constructor(minScores: IMuscleScores) {
		this._minScores = new MuscleScores(minScores);
	}

	public overlaps(scores: MuscleScores): boolean {
		for (const m of this._added) {
			if (scores.get(m).endurance) {
				return true;
			}
		}
		return false;
	}

	public hasSameMuscles(scores: MuscleScores): boolean {
		for (const m of this._added) {
			if (!scores.get(m).endurance) {
				return false;
			}
		}
		return true;
	}

	public isSatisfiedBy(scores: MuscleScores): boolean {
		for (const m of this._added) {
			if (scores.get(m).isLessThan(this._minScores.get(m))) {
				return false;
			}
		}
		return true;
	}
}
