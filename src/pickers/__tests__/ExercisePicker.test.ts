import ExercisePicker from '../ExercisePicker';
import MuscleScores from '../../muscles/MuscleScores';
import WorkoutTarget from '../../WorkoutTarget';
import { Difficulty, Result } from '../../global/enum';

describe('ExercisePicker unit test', () => {
	test('pick', () => {
		// Note that actual score values are not used by ExercisePicker
		const muscleGoals: IMuscleScores = {
			glutes: { endurance: 100, strength: 100 },
			biceps: { endurance: 100, strength: 100 },
		};
		const target = new WorkoutTarget({
			difficulty: Difficulty.Easy,
			muscleGoals,
			focusMuscleGoals: muscleGoals,
			enduranceRatio: 0.5,
			timeMinutes: 40,
		});
		const picker = new ExercisePicker(target);

		const gen = picker.pick();

		let curr = gen.next();
		let n = 0;

		expect(curr.done).toEqual(false);
		while (!curr.done && n < 10) {
			const exercises = curr.value;

			const scores = MuscleScores.combine(...exercises.map(e => e.muscleScoreFactors));
			expect(target.hasAllMuscles(scores)).toEqual(true);

			curr = gen.next(Math.random() < 0.5 ? Result.Complete : Result.Incomplete);
			n += 1;
		}
	});
});
