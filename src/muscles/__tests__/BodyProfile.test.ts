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
		    	glutes: { endurance: 1.48, strength: 1.45 },
		      	quads: { endurance: 3.09, strength: 1.4 },
		      	calves: { endurance: 28.72, strength: 20.11 },
  			},
  			muscleGoals: {
		      	glutes: { endurance: 1.48, strength: 1.45 },
		      	quads: { endurance: 3.09, strength: 1.4 },
		      	calves: { endurance: 28.72, strength: 20.11 },
		    	upper_chest: { endurance: 6.78, strength: 0 },
		      	triceps: { endurance: 14.39, strength: 2.42 },
		      	front_delt: { endurance: 13.38, strength: 1.28 },
		      	middle_delt: { endurance: 30.99, strength: 21.28 },
		      	rear_delt: { endurance: 30.99, strength: 21.28 },
		      	traps: { endurance: 13.76, strength: 13.41 },
		      	lats: { endurance: 12.05, strength: 14.89 },
		      	erectors: { endurance: 7.2, strength: 4.32 },
		      	rhomboids: { endurance: 14.36, strength: 12.89 },
		      	inner_thighs: { endurance: 0, strength: 1.78 },
		      	forearms: { endurance: 6.26, strength: 19.87 },
  			},
		});
	});
});
