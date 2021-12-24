import Exercise from '../exercises/Exercise';
import Matcher from './Matcher';
import BodyProfile from '../muscles/BodyProfile';
import * as util from '../global/util';

export default class SkillMatcher extends Matcher {
	constructor(
		exercises: Exercise[],
		bodyProfile: BodyProfile
	) {
		super(exercises, bodyProfile);
	}

	public getMatch<Skill>(): Skill[] {
		const ratio = this.bodyProfile.getWorkoutEnduranceRatio();
		const counts = util.splitEvenly(this.total, [1 - ratio, ratio]);

		const strengths = new Array(counts[0]).fill('strength');
		const endurances = new Array(counts[1]).fill('endurance');
		const sortedSkills = [...strengths, ...endurances];

		return this.match(sortedSkills);
	}

	public getPriorityValue(exercise: Exercise, index: number): number {
		const score = this.getPriorityScore(exercise);
		return score.endurance / score.strength;
	}
}
