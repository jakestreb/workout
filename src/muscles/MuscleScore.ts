interface BuildArg {
	strength?: number;
	endurance?: number;
}

export default class MuscleScore {
	public static combine(...args: MuscleScore[]): MuscleScore {
		return args.reduce((a, b) => a.add(b), new MuscleScore());
	}

	public static getPercentileScores(percentile: number, ...muscleScores: MuscleScore[]): MuscleScore {
		return new MuscleScore({
			strength: getPercentile(percentile, muscleScores.map(m => m.strength)),
			endurance: getPercentile(percentile, muscleScores.map(m => m.endurance))
		});
	}

	public strength: number = 0;
	public endurance: number = 0;

	public isLocked: boolean = false;

	constructor({ strength, endurance }: BuildArg = {}) {
		this.strength = strength || 0;
		this.endurance = endurance || 0;
	}

	public getMax(): string {
		return this.strength > this.endurance ? 'strength' : 'endurance';
	}

	public add(m: MuscleScore|number): MuscleScore {
		if (typeof m === 'number') {
			this.strength += m;
			this.endurance += m;
			return this;
		}
		this.strength += m.strength;
		this.endurance += m.endurance;
		return this;
	}

	public subtract(m: MuscleScore|number): MuscleScore {
		if (typeof m === 'number') {
			this.strength -= m;
			this.endurance -= m;
			return this;
		}
		return this.add(m.copy().multiply(-1));
	}

	public copy(): MuscleScore {
		return new MuscleScore().add(this);
	}

	public multiply(m: MuscleScore|number): MuscleScore {
		if (typeof m === 'number') {
			this.strength *= m;
			this.endurance *= m;
			return this;
		}
		this.strength *= m.strength;
		this.endurance *= m.endurance;
		return this;
	}

	public divideBy(m: MuscleScore|number): MuscleScore {
		if (typeof m === 'number') {
			this.strength /= m;
			this.endurance /= m;
			return this;
		}
		this.strength /= m.strength;
		this.endurance /= m.endurance;
		return this;
	}
}

function getPercentile(percentile: number, array: number[]) {
	const index = Math.floor(array.length * percentile);
	return array.sort((a, b) => a - b)[index];
}
