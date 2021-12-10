import Score from './Score';
import * as util from '../global/util';

export default class MuscleScores {

	public static combine(...args: MuscleScores[]): MuscleScores {
		return args.reduce((a, b) => a.combine(b), new MuscleScores());
	}

	private readonly _scores: {[muscle: string]: Score} = {};

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
	// - the mean of the primary skill is scaled to 'mean'
	// - the ratios of the skill means remains the same
	// - the standard deviations of both skills is scaled to 'std'
	public scale(mean: number, std: number): MuscleScores {
		const skillRatio = this.total[this.secondary] / this.total[this.primary];

		const primaryFn = (vs: number[]) => util.normalScale(vs, mean, std);
		const secondaryFn = (vs: number[]) => util.normalScale(vs, mean * skillRatio, std);

		return this.applyToSkill(primaryFn, this.primary)
			.applyToSkill(secondaryFn, this.secondary);
	}
}

function getPercentile(percentile: number, array: number[]) {
	const index = Math.floor(array.length * percentile);
	return array.sort((a, b) => a - b)[index];
}
