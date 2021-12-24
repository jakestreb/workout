import Exercise from '../exercises/Exercise';
import BodyProfile from '../muscles/BodyProfile';
import MuscleScores from '../muscles/MuscleScores';
import Score from '../muscles/Score';
import * as util from '../global/util';

export default abstract class Matcher {
	public exercises: Exercise[];
	public bodyProfile: BodyProfile;

	constructor(exercises: Exercise[], bodyProfile: BodyProfile) {
		this.exercises = exercises;
		this.bodyProfile = bodyProfile;
	}

	public abstract getPriorityValue(exercise: Exercise, index: number): number;

	public abstract getMatch<T>(): T[];

	public get total(): number {
		return this.exercises.length;
	}

	public match<T>(sortedPartners: T[]): T[] {
		const result: T[] = new Array(this.total);
		const partners = sortedPartners.slice();
		const priorities = this._getPriorityValues();

		while (sortedPartners.length > 0) {
			const i = util.maxIndex(priorities);
			result[i] = partners.pop()!;
			priorities[i] = -1;
		}

		return result;
	}

	public getPriorityScore(exercise: Exercise): Score {
		const goalFactorScores = new MuscleScores();
		const standardScores = exercise.getStandardFocusScores(this.bodyProfile.user);
		standardScores.keys.forEach(m => {
			const goal = this.bodyProfile.getGoalDiscrepancy(m);
			goalFactorScores.set(m, standardScores.get(m).multiply(goal));
		});
		return goalFactorScores.total;
	}

	private _getPriorityValues(): number[] {
		return this.exercises.map((e, i) => this.getPriorityValue(e, i));
	}
}
