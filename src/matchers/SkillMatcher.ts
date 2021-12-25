import WorkoutTarget from '../WorkoutTarget';
import Exercise from '../exercises/Exercise';
import Matcher from './Matcher';
import Score from '../muscles/Score';
import * as util from '../global/util';

export default class SkillMatcher extends Matcher<Skill> {
	constructor(
		exercises: Exercise[],
		target: WorkoutTarget
	) {
		super(exercises, target);
	}

	public getSortedAttributes(): Skill[] {
		const ratio = this.target.enduranceRatio;
		const counts = util.splitEvenly(this.total, [1 - ratio, ratio]);

		const strengths = new Array(counts[0]).fill('strength');
		const endurances = new Array(counts[1]).fill('endurance');

		return [...strengths, ...endurances];
	}

	public getPriorityValue(exercise: Exercise, index: number, priorityScore: Score): number {
		return priorityScore.endurance / priorityScore.strength;
	}
}
