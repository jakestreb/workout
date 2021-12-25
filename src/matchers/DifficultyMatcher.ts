import WorkoutTarget from '../WorkoutTarget';
import Exercise from '../exercises/Exercise';
import Matcher from './Matcher';
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
		target: WorkoutTarget
	) {
		super(exercises, target);

		this.skills = skills;
	}

	public getSortedAttributes(): Difficulty[] {
		const ratios = DifficultyMatcher.RATIOS[this.target.difficulty];
		const counts = util.splitEvenly(this.total, ratios);

		const sortedDifficulties: Difficulty[] = [];
		getKeys(Difficulty).forEach(d => {
			const items = new Array(counts[d]).fill(d);
			sortedDifficulties.push(...items);
		});
		return sortedDifficulties;
	}

	public getPriorityValue(exercise: Exercise, index: number, priorityScore: Score): number {
		return priorityScore[this.skills[index]];
	}
}
