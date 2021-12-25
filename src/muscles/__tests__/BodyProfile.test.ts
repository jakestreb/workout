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

		db.users.getOne = jest.fn().mockResolvedValue({
		  id: Difficulty.Intermediate,
		  name: 'Jake',
		  gender: 'male',
		  weight: 180,
		  experience: 'advanced',
		  primary_focus: 'strength',
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
			.subtract(bodyProfile.getMuscleScore('glutes'));
		expect(discrepancies.get('glutes').round()).toEqual(manualDiscrepancy.round());
	});

	test('getWorkoutTarget', () => {
		const target = bodyProfile.getWorkoutTarget({
			difficulty: 1,
			muscles: ['glutes', 'quads', 'calves'],
			timeMinutes: 40,
		});
		expect(target).toEqual({
  			minScores: {
  				glutes: {
  					endurance: 1.91,
  					strength: 1.39,
  				},
  				quads: {
  					endurance: 2.01,
  					strength: 1.38,
  				},
  				calves: {
  					endurance: 4.08,
  					strength: 3.51,
  				},
  			},
  			maxScores: {
  				glutes: {
  					endurance: 2.58,
  					strength: 1.91,
  				},
  				quads: {
  					endurance: 2.68,
  					strength: 1.91,
  				},
  				calves: {
  					endurance: 4.75,
  					strength: 4.03,
  				},
  			},
  			timeMinutes: 40,
		});
	});
});
