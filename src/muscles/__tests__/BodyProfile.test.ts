import UserRecords from '../../exercises/UserRecords';
import BodyProfile from '../BodyProfile';
import Score from '../Score'
import db from '../../db';
import { Difficulty } from '../../global/enum';
import testRecords from './data/records.json';

describe('BodyProfile unit test', () => {

	let userRecords: UserRecords;
	let bodyProfile: BodyProfile;

	beforeAll(async () => {
		await db.init();

		// 2021-12-31T00:00:00.000Z
		Date.now = jest.fn().mockReturnValue(1640908800000);

		db.users.getOne = jest.fn().mockResolvedValue({
		  id: 1,
		  name: 'Jake',
		  gender: 'male',
		  weight: 180,
		  experience: 'advanced',
		});
		db.records.getForUser = jest.fn().mockResolvedValue(testRecords);

		userRecords = await UserRecords.fromUserId(1);

		bodyProfile = new BodyProfile(userRecords);
	});

	test('getMuscleScore', () => {
		// Muscle score should be exercise scores weighted by muscle involvement

		// deadlift / glutes: 3
		// squat / glutes: 4
		// good_morning / glutes: 4.5
		// kettlebell_swing / glutes: 2

		// total glutes: 13.5

		const score = Score.combine(
			userRecords.getBestScores('deadlift')!.multiply(3 / 13.5),
			userRecords.getBestScores('squat')!.multiply(4 / 13.5),
			userRecords.getBestScores('good_morning')!.multiply(4.5 / 13.5),
			userRecords.getBestScores('kettlebell_swing')!.multiply(2 / 13.5)
		);

		expect(bodyProfile.getMuscleScore('glutes').round()).toEqual(score.round());
	});

	test('getGoalScore', () => {
		const scores = bodyProfile.getMuscleScores();
		expect(bodyProfile.getGoalScore().round()).toEqual(scores.getPercentile(.75).round());
	});

	test('getGoalDiscrepancies', () => {
		const discrepancies = bodyProfile.getGoalDiscrepancies();
		const manualDiscrepancy = bodyProfile.getGoalScore()
			.divideBy(bodyProfile.getMuscleScore('glutes'));
		expect(discrepancies.get('glutes').round()).toEqual(manualDiscrepancy.round());
	});

	test('getWorkoutTarget', () => {
		const target = bodyProfile.getWorkoutTarget({
			difficulty: Difficulty.Intermediate,
			muscles: ['glutes', 'quads', 'calves'],
			timeMinutes: 40,
		});
		expect(target).toEqual({
			difficulty: Difficulty.Intermediate,
  			timeMinutes: 40,
  			enduranceRatio: 0.5,
  			focusMuscleGoals: {
		    	glutes: { endurance: 1.09, strength: 1.03 },
		      	quads: { endurance: 1.1, strength: 1.02 },
		      	calves: { endurance: 1.5, strength: 1.26 },
  			},
  			muscleGoals: {
		    	glutes: { endurance: 1.09, strength: 1.03 },
		      	quads: { endurance: 1.1, strength: 1.02 },
		      	calves: { endurance: 1.5, strength: 1.26 },
		      	biceps: { endurance: 0.82, strength: 1.1 },
		    	upper_chest: { endurance: 1.0, strength: 0.92 },
		    	middle_chest: { endurance: 0.87, strength: 0.83 },
		    	lower_chest: { endurance: 0.81, strength: 0.79 },
		      	triceps: { endurance: 1.14, strength: 1.01 },
		      	front_delt: { endurance: 1.12, strength: 1.0 },
		      	middle_delt: { endurance: 1.66, strength: 1.28 },
		      	rear_delt: { endurance: 1.66, strength: 1.28 },
		      	traps: { endurance: 1.39, strength: 1.1 },
		      	lats: { endurance: 1.26, strength: 1.1 },
		      	erectors: { endurance: 1.25, strength: 1.05 },
		      	rhomboids: { endurance: 1.42, strength: 1.1 },
		      	inner_thighs: { endurance: 1, strength: 1.01 },
		      	hamstrings: { endurance: 1.03, strength: 1 },
		      	forearms: { endurance: 0.97, strength: 1.1},
  			},
		});
	});
});
