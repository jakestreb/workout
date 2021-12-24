import ExercisePicker from '../ExercisePicker';
import MuscleScores from '../../muscles/MuscleScores';
import WorkoutTarget from '../../WorkoutTarget';
import { Result } from '../../global/enum';

describe('ExercisePicker unit test', () => {
	test('pick', () => {
		// Note that actual score values are not used by ExercisePicker
		const minScores: IMuscleScores = {
			glutes: { endurance: 100, strength: 100 },
			biceps: { endurance: 100, strength: 100 },
		};
		const maxScores: IMuscleScores = {
			glutes: { endurance: 100, strength: 100 },
			biceps: { endurance: 100, strength: 100 },
		};
		const target = new WorkoutTarget({ minScores, maxScores, timeMinutes: 40 });
		const picker = new ExercisePicker(target);

		const gen = picker.pick();

		let curr = gen.next();
		let n = 0;

		expect(curr.done).toEqual(false);
		while (!curr.done && n < 10) {
			const exercises = curr.value;
			console.warn('exercises', exercises.map(e => e.name));

			const scores = MuscleScores.combine(...exercises.map(e => e.muscleScoreFactors));
			console.warn('scores', scores);
			expect(target.checkFocusMuscles(scores)).toEqual(true);

			curr = gen.next(Math.random() < 0.5 ? Result.Complete : Result.Incomplete);
			n += 1;
		}
	});
});
