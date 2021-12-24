import Exercise from '../exercises/Exercise';
import Matcher from './Matcher';
import BodyProfile from '../muscles/BodyProfile';
import { Difficulty, getKeys } from '../global/enum';
import * as util from '../global/util';

export default class DifficultyMatcher extends Matcher {

	// Workout difficulty mapped to ratios of exercise difficulties in the workout
	public static RATIOS = {
		[Difficulty.Easy]: [0.5, 0.3, 0.2],
		[Difficulty.Intermediate]: [0.2, 0.5, 0.3],
		[Difficulty.Hard]: [0, 0.4, 0.6],
	};

	public workoutDifficulty: Difficulty;
	public skills: Skill[];

	constructor(
		exercises: Exercise[],
		skills: Skill[],
		workoutDifficulty: Difficulty,
		bodyProfile: BodyProfile
	) {
		super(exercises, bodyProfile);

		this.skills = skills;
		this.workoutDifficulty = workoutDifficulty;
	}

	public getMatch<Difficulty>(): Difficulty[] {
		const ratios = DifficultyMatcher.RATIOS[this.workoutDifficulty];
		const counts = util.splitEvenly(this.total, ratios);

		const sortedDifficulties: Difficulty[] = [];
		getKeys(Difficulty).forEach(d => {
			const items = new Array(counts[d]).fill(Difficulty[d]);
			sortedDifficulties.push(...items);
		});

		return this.match(sortedDifficulties);
	}

	public getPriorityValue(exercise: Exercise, index: number): number {
		const priorityScore = this.getPriorityScore(exercise);
		return priorityScore[this.skills[index]];
	}
}
