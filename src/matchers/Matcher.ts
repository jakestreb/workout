import Exercise from '../exercises/Exercise';
import BodyProfile from '../muscles/BodyProfile';
import MuscleScores from '../muscles/MuscleScores';
import Score from '../muscles/Score';
import * as util from '../global/util';

/**
 * Matches an array of any attributes (without replacement) to an array of exercises
 * in the optimal configuration
 */
export default abstract class Matcher<T> {
	public exercises: Exercise[];
	public bodyProfile: BodyProfile;

	constructor(exercises: Exercise[], bodyProfile: BodyProfile) {
		this.exercises = exercises;
		this.bodyProfile = bodyProfile;
	}

	/**
	 * Should return a value representing the comparative priority used to determine
	 * the attribute that the exercise matches with.
     */
	public abstract getPriorityValue(
		exercise: Exercise,
		index: number,
		priorityScore: Score,
	): number;

	// Should return an array of attributes to match to exercises, sorted such that
	// the exercise with the highest comparative priority matches with the last item.
	public abstract getSortedAttributes(...args: any): T[];

	public get total(): number {
		return this.exercises.length;
	}

	public getMatch(...args: any): T[] {
		const result: T[] = new Array(this.total);
		const attributes = this.getSortedAttributes(...args).slice();
		const priorities = this._getPriorityValues();

		while (attributes.length > 0) {
			const i = util.maxIndex(priorities);
			result[i] = attributes.pop()!;
			priorities[i] = -1;
		}

		return result;
	}

	private _getPriorityValues(): number[] {
		return this.exercises.map((e, i) =>
			this.getPriorityValue(e, i, this._getPriorityScore(e)));
	}

	private _getPriorityScore(exercise: Exercise): Score {
		const goalFactorScores = new MuscleScores();
		const standardScores = exercise.getStandardFocusScores(this.bodyProfile.user);
		standardScores.keys.forEach(m => {
			const goal = this.bodyProfile.getGoalDiscrepancy(m);
			const priority = standardScores.get(m).multiply(goal); // exercise score x goal dist
			goalFactorScores.set(m, priority);
		});
		return goalFactorScores.total;
	}
}
