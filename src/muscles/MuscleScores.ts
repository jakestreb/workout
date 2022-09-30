import Score from './Score';
import * as util from '../global/util';

export default class MuscleScores {

	// Exponential factor by which repeated exercises of the same muscle affect the
	// overall strength focus score of that muscle
	public static STRENGTH_EXP_FACTOR = 0.5;

	public static combine(...args: MuscleScores[]): MuscleScores {
		return args.reduce((a, b) => a.combine(b), new MuscleScores());
	}

	// Combine muscle scores across exercises in a way that takes into account
	// diminishing returns for strength
	public static combineExerciseScores(...args: MuscleScores[]): MuscleScores {
		const total = MuscleScores.combine(...args);
		const keys = total.keys;

		// Endurance scores - additive
		const enduranceScores = new MuscleScores();

		keys.forEach(m => {
			let endurance = total.get(m).endurance;
			// To balance out overall values for consumption, multiply overall
			// endurance score by STRENGTH_EXP_FACTOR to reduce it
			endurance *= MuscleScores.STRENGTH_EXP_FACTOR;
			enduranceScores.add(m, new Score({ endurance }));
		});

		// Strength scores - additive with exponential diminishing returns from max
		const strengthScores = new MuscleScores();

		keys.forEach(m => {
			args.map(muscleScores => muscleScores.get(m).strength)
			.filter(val => val)
			.sort((a, b) => b - a)
			.map((val, i) => val * Math.pow(MuscleScores.STRENGTH_EXP_FACTOR, i))
			.forEach(val => {
				strengthScores.add(m, new Score({ strength: val }));
			});
		});

		return MuscleScores.combine(enduranceScores, strengthScores);
	}

	private readonly _scores: {[muscle: string]: Score} = {};
	private readonly _scoreWeights: {[muscle: string]: number} = {};

	constructor(scores: IMuscleScores = {}) {
		Object.keys(scores).forEach(m => {
			this._scores[m] = new Score(scores[m])
		});
	}

	public get keys() {
		return Object.keys(this._scores);
	}

	public get values() {
		return this.keys.map(key => this.get(key));
	}

	public get total() {
		return Score.combine(...this.keys.map(k => this.get(k)));
	}

	public get primary(): Skill {
		return this.total.strength > this.total.endurance ? 'strength' : 'endurance';
	}

	public get secondary(): Skill {
		return this.total.endurance > this.total.strength ? 'strength' : 'endurance';
	}

	// TODO: REMOVE OTHER UNUSED FUNCTIONS!!
	public avgIn(m: string, score: Score, weight: number = 1) {
		this._scoreWeights[m] = this._scoreWeights[m] || 0;
		const prevTotal = this._scoreWeights[m];

		this._scoreWeights[m] += weight;
		const newTotal = this._scoreWeights[m];

		const currentPart = this.get(m).multiply(prevTotal / newTotal);
		const newPart = score.multiply(weight / newTotal);
		this.set(m, currentPart.add(newPart));
	}

	// Note that muscle groups should not be pushed to MuscleScores
	public set(muscleName: string, score: Score) {
		if (this._scores[muscleName] || score.isNonZero()) {
			this._scores[muscleName] = score;
		}
	}

	public add(muscleName: string, score: Score): Score {
		this._scores[muscleName] = this.get(muscleName).add(score);
		return this._scores[muscleName];
	}

	public multiply(m: Score|number): MuscleScores {
		this.keys.forEach(muscleName => {
			this._scores[muscleName] = this._scores[muscleName].multiply(m);
		});
		return this;
	}

	public combine(muscleScores: MuscleScores): MuscleScores {
		const result = this.copy();
		muscleScores.keys.forEach(m => {
			result.add(m, muscleScores.get(m));
		});
		return result;
	}

	public get(muscleName: string): Score {
		const val = this._scores[muscleName];
		return val ? val.copy() : new Score();
	}

	public getMap(): {[m: string]: IScore} {
		const result: {[m: string]: IScore} = {};
		Object.keys(this._scores).forEach(key => {
			result[key] = this.get(key).toJson();
		});
		return result;
	}

	public copy() {
		const result = new MuscleScores();
		this.keys.forEach(key => {
			result.set(key, this.get(key));
		});
		return result;
	}

	public round(): MuscleScores {
		const result = new MuscleScores();
		this.keys.forEach(key => {
			result.set(key, this.get(key).round());
		});
		return result;
	}

	public zeroFloor(): MuscleScores {
		const result = new MuscleScores();
		this.keys.forEach(key => {
			const floored = this.get(key).zeroFloor();
			result.set(key, floored);
		});
		return result;
	}

	public getPercentile(percentile: number): Score {
		return new Score({
			strength: getPercentile(percentile, this.values.map(m => m.strength)),
			endurance: getPercentile(percentile, this.values.map(m => m.endurance))
		});
	}

	public applyToSkill(fn: (arr: number[]) => number[], skill: 'strength'|'endurance'): MuscleScores {
		const result = this.copy();
		const opposite = skill === 'strength' ? 'endurance' : 'strength';

		const vals = fn(this.values.map(v => v[skill]));

		this.keys.forEach((m, i) => {
			result.set(m, new Score({ [skill]: vals[i], [opposite]: this.get(m)[opposite] }));
		});

		return result;
	}

	// Scale scores such that:
	// - the mean of the primary skill is scaled to 'primaryMean'
	// - the ratios of the skill means remains the same
	// - the standard deviations of both skills is scaled to 'std'
	public scale(primaryMean: number, std: number): MuscleScores {
		const skillRatio = this.total[this.secondary] / this.total[this.primary];

		const primaryFn = (vs: number[]) => util.normalScale(vs, primaryMean, std);
		const secondaryFn = (vs: number[]) => util.normalScale(vs, primaryMean * skillRatio, std);

		return this.applyToSkill(primaryFn, this.primary)
			.applyToSkill(secondaryFn, this.secondary);
	}

	public hasSubsetOf(scores: MuscleScores): boolean {
		for (const m of scores.keys) {
			if (this.get(m).isNonZero()) {
				return true;
			}
		}
		return false;
	}

	public hasAllOf(scores: MuscleScores): boolean {
		for (const m of scores.keys) {
			if (!this.get(m).isNonZero()) {
				return false;
			}
		}
		return true;
	}

	// Average of euclidean distances between scores
	public avgDistance(scores: MuscleScores): number {
		const dists = this.keys
			.map(m => scores.get(m).subtract(this.get(m)))
			.map(diff => Math.pow(diff.endurance, 2) + Math.pow(diff.strength, 2))
			.map(sum => Math.sqrt(sum));
		return util.sum(dists);
	}
}

function getPercentile(percentile: number, array: number[]) {
	const index = Math.floor(array.length * percentile);
	return array.sort((a, b) => a - b)[index];
}
