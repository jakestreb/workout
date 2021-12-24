import MuscleScores from '../MuscleScores'
import Score from '../Score';

describe('MuscleScores unit test', () => {
	test('MuscleScores.combineExerciseScores', () => {
		const deadlift = new MuscleScores();
		deadlift.set('glutes', new Score({ endurance: 1, strength: 3 }));
		deadlift.set('hamstrings', new Score({ endurance: 2, strength: 4 }));

		const squat = new MuscleScores();
		squat.set('glutes', new Score({ endurance: 5, strength: 7 }));
		squat.set('hamstrings', new Score({ endurance: 6, strength: 8 }));
		squat.set('quads', new Score({ endurance: 2, strength: 1 }));

		const combined = MuscleScores.combineExerciseScores(deadlift, squat);

		expect(combined.round().getMap()).toEqual(
			{
				'glutes': { endurance: 3, strength: 8.5 },
				'hamstrings': { endurance: 4, strength: 10 },
				'quads': { endurance: 1, strength: 1 },
			}
		);
	});

	test('scale', () => {
		const ms = new MuscleScores();
		ms.set('glutes', new Score({ endurance: 2, strength: 8 }));
		ms.set('hamstrings', new Score({ endurance: 2, strength: 8 }));
		ms.set('quads', new Score({ endurance: 4, strength: 12 }));
		ms.set('calves', new Score({ endurance: 8, strength: 6 }));

		expect(ms.scale(20, 4).round().getMap()).toEqual(
			{
				'glutes': { endurance: 6.15, strength: 19.08 },
				'hamstrings': { endurance: 6.15, strength: 19.08 },
				'quads': { endurance: 9.41, strength: 26.42 },
				'calves': { endurance: 15.94, strength: 15.41 },
			}
		);
	});
});
