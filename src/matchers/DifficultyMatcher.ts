import Exercise from '../exercises/Exercise';
import Matcher from './Matcher';
import BodyProfile from '../muscles/BodyProfile';
import Score from '../muscles/Score';
import { Difficulty, getKeys } from '../global/enum';
import * as util from '../global/util';

export default class DifficultyMatcher extends Matcher<Difficulty> {

	// Workout difficulty mapped to ratios of exercise difficulties in the workout
	public static RATIOS: { [key in Difficulty]: number[] } = {
		[Difficulty.Easy]: [0.5, 0.3, 0.2],
		[Difficulty.Intermediate]: [0.2, 0.5, 0.3],
		[Difficulty.Hard]: [0, 0.4, 0.6],
	};

	public skills: Skill[];

	constructor(
		exercises: Exercise[],
		skills: Skill[],
		bodyProfile: BodyProfile
	) {
		super(exercises, bodyProfile);

		this.skills = skills;
	}

	public getSortedAttributes(workoutDifficulty: Difficulty): Difficulty[] {
		if (workoutDifficulty === undefined) {
			throw new Error('workoutDifficulty is required');
		}

		const ratios = DifficultyMatcher.RATIOS[workoutDifficulty];
		const counts = util.splitEvenly(this.total, ratios);

		const sortedDifficulties: Difficulty[] = [];
		getKeys(Difficulty).forEach(d => {
			const items = new Array(counts[d]).fill(Difficulty[d]);
			sortedDifficulties.push(...items);
		});
		return sortedDifficulties;
	}

	public getPriorityValue(exercise: Exercise, index: number, priorityScore: Score): number {
		return priorityScore[this.skills[index]];
	}
}
