import Score from './Score';

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

	public get total() {
		return Score.combine(...this.keys.map(k => this.get(k)));
	}

	// Note that muscle groups should not be pushed to MuscleScores
	public set(muscleName: string, score: Score) {
		this._scores[muscleName] = score;
	}

	public add(muscleName: string, score: Score): Score {
		this._scores[muscleName] = this.get(muscleName);
		this._scores[muscleName].add(score);
		return this._scores[muscleName];
	}

	public combine(muscleScores: MuscleScores): MuscleScores {
		muscleScores.keys.forEach(m => {
			this._scores[m].add(muscleScores.get(m));
		});
		return this;
	}

	public get(muscleName: string): Score {
		return this._scores[muscleName] || new Score();
	}

	public getRatio(muscleName: string): Score {
		return this.get(muscleName).copy().divideBy(this.total);
	}

	public getMap() {
		return this._scores;
	}
}
