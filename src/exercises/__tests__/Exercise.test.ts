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
		};
		const repsWeight = new RepsWeight({ sets: 5, reps: 8, weight: 15 });
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
		};
		const repsWeight = new RepsWeight({ sets: 5, reps: 8, weight: 15 });
		const muscleScores = exercise.getFocusScores(repsWeight, user).round();

		expect(muscleScores.getMap()).toEqual({
			front_delt: new Score({ endurance: 1.05, strength: 0.83 }),
			middle_delt: new Score({ endurance: 3.15, strength: 2.48 }),
	        rear_delt: new Score({ endurance: 1.58, strength: 1.24 }),
		});
	});

	test('scaleRepsWeight', () => {
		const exercise = new Exercise('lateral_raise');
		const user: DBUser = {
			id: 1,
			name: 'Jake',
			gender: 'male',
			weight: 180,
			experience: 'advanced',
		};

		// Endurance
		let repsWeight = new RepsWeight({ sets: 3, reps: 8, weight: 30 });
		let scaled = exercise.scaleRepsWeight(repsWeight, 'endurance', user);

		expect(`${scaled}`).toEqual('3x10 25');

		let beforeScore = exercise.getScore(repsWeight, user);
		let afterScore = exercise.getScore(scaled, user);

		expect(afterScore.endurance).toBeGreaterThanOrEqual(beforeScore.endurance);
		expect(afterScore.strength).toBeLessThanOrEqual(beforeScore.strength);

		// Strength
		repsWeight = new RepsWeight({ sets: 3, reps: 8, weight: 30 });
		scaled = exercise.scaleRepsWeight(repsWeight, 'strength', user);

		expect(`${scaled}`).toEqual('3x8 30');

		beforeScore = exercise.getScore(repsWeight, user);
		afterScore = exercise.getScore(scaled, user);

		expect(afterScore.endurance).toBeLessThanOrEqual(beforeScore.endurance);
		expect(afterScore.strength).toBeGreaterThanOrEqual(beforeScore.strength);
	});
});
