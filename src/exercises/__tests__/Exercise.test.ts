import Exercise from '../Exercise';
import RepsWeight from '../RepsWeight';
import Score from '../../muscles/Score';

describe('Exercise unit test', () => {

	test('getScore', () => {
		const exercise = new Exercise('lateral_raise');
		const user: DBUser = {
			id: 1,
			name: 'Jake',
			gender: 'male',
			weight: 180,
			experience: 'advanced',
			primary_focus: 'strength',
		};
		const repsWeight = new RepsWeight({ reps: [8, 8, 8, 8, 8], weight: 15 });
		const score = exercise.getScore(repsWeight, user).round();

		expect(score).toEqual(
			new Score({ endurance: 1.05, strength: 0.83 })
		);
	});

	test('getFocusScores', () => {
		const exercise = new Exercise('lateral_raise');
		const user: DBUser = {
			id: 1,
			name: 'Jake',
			gender: 'male',
			weight: 180,
			experience: 'advanced',
			primary_focus: 'strength',
		};
		const repsWeight = new RepsWeight({ reps: [8, 8, 8, 8, 8], weight: 15 });
		const muscleScores = exercise.getFocusScores(repsWeight, user).round();

		expect(muscleScores.getMap()).toEqual({
			front_delt: new Score({ endurance: 1.05, strength: 0.83 }),
			middle_delt: new Score({ endurance: 3.15, strength: 2.48 }),
	        rear_delt: new Score({ endurance: 1.58, strength: 1.24 }),
		});
	});
});
