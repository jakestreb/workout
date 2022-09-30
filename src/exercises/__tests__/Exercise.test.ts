import Exercise from '../Exercise';
import RepsWeight from '../RepsWeight';
import Score from '../../muscles/Score';

// References:
//
// "name": "bench_press",
// "activations": [{
//     "muscle": "upper_chest",
//     "activity": 2.5
//   },
//   {
//     "muscle": "middle_chest",
//     "activity": 3
//   },
//   {
//     "muscle": "lower_chest",
//     "activity": 2.5
//   },
//   {
//     "muscle": "triceps",
//     "activity": 1.5
//   },
//   {
//     "muscle": "front_delt",
//     "activity": 2.5
//   }
// ],
// "reps": {
//   "endurance": 10,
//   "strength": 4
// },
// "weightStandards": {
//   "male": 165,
//   "female": 90
// }
//
//
// "name": "lateral_raise",
// "weight": 1,
// "activations": [
//   {
//     "muscle": "front_delt",
//     "activity": 1
//   },
//   {
//     "muscle": "middle_delt",
//     "activity": 3
//   },
//   {
//     "muscle": "rear_delt",
//     "activity": 1.5
//   }
// ],
// "reps": {
//   "endurance": 15,
//   "strength": 8
// },
// "weightStandards": {
//   "male": 20,
//   "female": 12
// }
//

describe('Exercise unit test', () => {

	test('getScore', () => {
		const user: DBUser = {
			id: 1,
			name: 'Jake',
			gender: 'male',
			weight: 180,
			experience: 'advanced',
		};

		let repsWeight, score;

		const benchPress = new Exercise('bench_press');
		repsWeight = new RepsWeight({ sets: 4, reps: 7, weight: 165 });
		score = benchPress.getScore(repsWeight, user).round();
		expect(score).toEqual(
			new Score({ endurance: 1.2, strength: 1.0 })
		);
		repsWeight = new RepsWeight({ sets: 4, reps: 10, weight: 165 });
		score = benchPress.getScore(repsWeight, user).round();
		expect(score).toEqual(
			new Score({ endurance: 1.71, strength: 1.0 })
		);
		repsWeight = new RepsWeight({ sets: 4, reps: 7, weight: 185 });
		score = benchPress.getScore(repsWeight, user).round();
		expect(score).toEqual(
			new Score({ endurance: 1.2, strength: 1.12 })
		);

		const lateralRaise = new Exercise('lateral_raise');
		repsWeight = new RepsWeight({ sets: 5, reps: 8, weight: 15 });
		score = lateralRaise.getScore(repsWeight, user).round();
		expect(score).toEqual(
			new Score({ endurance: 1.02, strength: 0.75 })
		);
	});

	test('getFocusScores', () => {
		// Lateral raise for 2 users
		let exercise = new Exercise('lateral_raise');

		let user: DBUser = {
			id: 1,
			name: 'Jake',
			gender: 'male',
			weight: 180,
			experience: 'advanced',
		};
		let repsWeight = new RepsWeight({ sets: 5, reps: 8, weight: 15 });
		let muscleScores = exercise.getFocusScores(repsWeight, user).round();
		expect(muscleScores.getMap()).toEqual({
			front_delt: new Score({ endurance: 1.02, strength: 0.75 }),
			middle_delt: new Score({ endurance: 3.05, strength: 2.25 }),
	        rear_delt: new Score({ endurance: 1.53, strength: 1.13 }),
		});

		user = {
			id: 1,
			name: 'Marguerite',
			gender: 'female',
			weight: 100,
			experience: 'advanced',
		};
		repsWeight = new RepsWeight({ sets: 5, reps: 8, weight: 15 });
		muscleScores = exercise.getFocusScores(repsWeight, user).round();
		expect(muscleScores.getMap()).toEqual({
			front_delt: new Score({ endurance: 1.02, strength: 1.25 }),
			middle_delt: new Score({ endurance: 3.05, strength: 3.75 }),
	        rear_delt: new Score({ endurance: 1.53, strength: 1.88 }),
		});

		// Push up for 2 users
		exercise = new Exercise('push_up');
		user = {
			id: 1,
			name: 'Jake',
			gender: 'male',
			weight: 180,
			experience: 'advanced',
		};
		repsWeight = new RepsWeight({ sets: 3, reps: 20, weight: null });
		muscleScores = exercise.getFocusScores(repsWeight, user).round();
		expect(muscleScores.getMap()).toEqual({
			front_delt: new Score({ endurance: 3.33, strength: 2.5 }),
			lower_chest: new Score({ endurance: 0.67, strength: 0.5 }),
			middle_chest: new Score({ endurance: 0.67, strength: 0.5 }),
			triceps: new Score({ endurance: 1.33, strength: 1.0 }),
			upper_chest: new Score({ endurance: 0.67, strength: 0.5 }),
		});

		user = {
			id: 1,
			name: 'Marguerite',
			gender: 'female',
			weight: 100,
			experience: 'advanced',
		};
		repsWeight = new RepsWeight({ sets: 3, reps: 20, weight: null });
		muscleScores = exercise.getFocusScores(repsWeight, user).round();
		expect(muscleScores.getMap()).toEqual({
			front_delt: new Score({ endurance: 3.33, strength: 2.5 }),
			lower_chest: new Score({ endurance: 0.67, strength: 0.5 }),
			middle_chest: new Score({ endurance: 0.67, strength: 0.5 }),
			triceps: new Score({ endurance: 1.33, strength: 1.0 }),
			upper_chest: new Score({ endurance: 0.67, strength: 0.5 }),
		});
	});
});
