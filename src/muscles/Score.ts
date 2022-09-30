import * as util from '../global/util';

interface BuildArg {
	strength?: number;
	endurance?: number;
}

export default class Score {
	public static combine(...args: Score[]): Score {
		return args.reduce((a, b) => a.add(b), new Score());
	}

	public strength: number = 0;
	public endurance: number = 0;

	constructor({ strength, endurance }: BuildArg = {}) {
		this.strength = strength || 0;
		this.endurance = endurance || 0;
	}

	public get total(): number {
		return this.strength + this.endurance;
	}

	public getMax(): string {
		return this.strength > this.endurance ? 'strength' : 'endurance';
	}

	public add(m: Score|number): Score {
		const result = this.copy();
		if (typeof m === 'number') {
			result.strength += m;
			result.endurance += m;
			return result;
		}
		result.strength += m.strength;
		result.endurance += m.endurance;
		return result;
	}

	public subtract(m: Score|number): Score {
		if (typeof m === 'number') {
			this.strength -= m;
			this.endurance -= m;
			return this;
		}
		return this.copy().add(m.copy().multiply(-1));
	}

	public copy(): Score {
		return new Score({
			strength: this.strength,
			endurance: this.endurance,
		});
	}

	public multiply(m: Score|number): Score {
		const result = this.copy();
		if (typeof m === 'number') {
			result.strength *= m;
			result.endurance *= m;
			return result;
		}
		result.strength *= m.strength;
		result.endurance *= m.endurance;
		return result;
	}

	public divideBy(m: Score|number): Score {
		const result = this.copy();
		if (typeof m === 'number') {
			result.strength /= m;
			result.endurance /= m;
			return result;
		}
		result.strength /= m.strength;
		result.endurance /= m.endurance;
		return result;
	}

	public zeroFloor(): Score {
		const result = this.copy();
		result.endurance = Math.max(this.endurance, 0);
		result.strength = Math.max(this.strength, 0);
		return result;
	}

	public isLessThan(m: Score): boolean {
		return this.strength < m.strength && this.endurance < m.endurance;
	}

	public isGreaterThan(m: Score): boolean {
		return this.strength > m.strength && this.endurance > m.endurance;
	}

	public isNonZero(): boolean {
		return this.strength !== 0 || this.endurance !== 0;
	}

	public round(): Score {
		const result = this.copy();
		result.strength = util.round(this.strength, 2);
		result.endurance = util.round(this.endurance, 2);
		return result;
	}

	public toJson(): IScore {
		return {
			endurance: this.endurance,
			strength: this.strength,
		};
	}
}
