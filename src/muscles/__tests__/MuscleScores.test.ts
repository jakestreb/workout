import MuscleScores from '../MuscleScores'
import Score from '../Score';

describe('MuscleScores unit test', () => {
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
