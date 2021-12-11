import ExercisePicker from '../ExercisePicker';
import MuscleScores from '../../muscles/MuscleScores';
import WorkoutTarget from '../../WorkoutTarget';

describe('ExercisePicker unit test', () => {
	test('pick', () => {
		const minScores: IMuscleScores = {
			glutes: { endurance: 4, strength: 4 },
			biceps: { endurance: 3, strength: 3 },
		};
		const target = new WorkoutTarget({ minScores, timeMinutes: 40 });
		const picker = new ExercisePicker(target);

		const gen = picker.pick();

		let curr = gen.next();
		let n = 0;
		while (!curr.done && n < 10) {
			const exercises = curr.value;

			const scores = MuscleScores.combine(...exercises.map(e => e.muscleScoreFactors));
			target.checkFocusMuscles();

			curr = gen.next();
			n += 1;
		}

	});
});
