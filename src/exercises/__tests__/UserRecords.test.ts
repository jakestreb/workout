import UserRecords from '../UserRecords';
import db from '../../db';
import { Difficulty } from '../../global/enum';
import testRecords from './data/records.json';
import qualityTestRecords from './data/quality_test_records.json';

const BENCH_PRESS_RECORDS: DBRecord[] = [
	{
		user_id: 1,
		workout_id: '1',
		exercise: 'bench_press',
		sets: 4,
		reps: 6,
		weight: 225,
		completed: true,
		created_at: '2021-12-08T16:49:35.220Z',
	},
	{
		user_id: 1,
		workout_id: '1',
		exercise: 'bench_press',
		sets: 4,
		reps: 8,
		weight: 235,
		completed: false,
		created_at: '2021-11-08T16:49:35.220Z',
	},
	{
		user_id: 1,
		workout_id: '1',
		exercise: 'bench_press',
		sets: 4,
		reps: 10,
		weight: 185,
		completed: true,
		created_at: '2021-05-08T16:49:35.220Z',
	},
];

const ADJUSTED_BENCH_PRESS_RECORDS: DBRecord[] = [
	{
		user_id: 1,
		workout_id: '1',
		exercise: 'bench_press',
		sets: 4,
		reps: 6,
		weight: 225,
		completed: true,
		created_at: '2021-12-08T16:49:35.220Z',
	},
	{
		user_id: 1,
		workout_id: '1',
		exercise: 'bench_press',
		sets: 4,
		reps: 5.46,
		weight: 231.48,
		completed: false,
		created_at: '2021-11-08T16:49:35.220Z',
	},
	{
		user_id: 1,
		workout_id: '1',
		exercise: 'bench_press',
		sets: 4,
		reps: 8.38,
		weight: 166.43,
		completed: true,
		created_at: '2021-05-08T16:49:35.220Z',
	},
];

describe('UserRecords unit test', () => {

	let userRecords: UserRecords;

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
	});

	test('getRecords', () => {
		expect(userRecords.getRecords('bench_press'))
			.toEqual(BENCH_PRESS_RECORDS);
	});

	test('getAdjustedRecords - basic', () => {
		expect(userRecords.getAdjustedRecords('bench_press'))
			.toEqual(ADJUSTED_BENCH_PRESS_RECORDS);
	});

	test('getAdjustedRecords - degradeQuality', async () => {
		db.records.getForUser = jest.fn().mockResolvedValue(qualityTestRecords.original);
		const qualityUserRecords = await UserRecords.fromUserId(1);

		expect(qualityUserRecords.getAdjustedRecords('bench_press'))
			.toEqual(qualityTestRecords.adjusted);
	});

	test('getPersonalBests', async () => {
		db.records.getForUser = jest.fn().mockResolvedValue(testRecords);
		userRecords = await UserRecords.fromUserId(1);

		const personalBests = userRecords.getPersonalBests('bench_press');
		expect(personalBests).not.toBeNull();

		const { endurance, strength } = personalBests!;
		expect(`${endurance}`).toEqual('4x8 165');
		expect(`${strength}`).toEqual('4x6 225');
	});

	test('getBestScores', () => {
		const score = userRecords.getBestScores('bench_press');
		expect(score).not.toBeNull();

		const { endurance, strength } = score!.round();
		expect(endurance).toEqual(1.11);
		expect(strength).toEqual(1.26);
	});

	test('getRecommendations', () => {
		const recs = userRecords.getRecommendations('bench_press');
		expect(`${recs!.endurance}`).toEqual('4x9 150');
		expect(`${recs!.strength}`).toEqual('4x5 270'); // TODO: Should be fewer reps / higher weight
	});

	test('getPossibleRepsWeights', () => {
		// Strength
		let recs = userRecords.getPossibleRepsWeights('bench_press', 'strength', Difficulty.Easy);
		expect(recs.map(r => r.toString())).toEqual(['3x7 190', '4x7 190']);

		recs = userRecords.getPossibleRepsWeights('bench_press', 'strength', Difficulty.Intermediate);
		expect(recs.map(r => r.toString())).toEqual(['3x7 195', '4x7 195', '5x7 195']);

		recs = userRecords.getPossibleRepsWeights('bench_press', 'strength', Difficulty.Hard);
		expect(recs.map(r => r.toString())).toEqual(['4x7 200', '5x7 200']);

		// Endurance
		recs = userRecords.getPossibleRepsWeights('bench_press', 'endurance', Difficulty.Easy);
		expect(recs.map(r => r.toString())).toEqual(['3x6 165', '4x6 165']);

		recs = userRecords.getPossibleRepsWeights('bench_press', 'endurance', Difficulty.Intermediate);
		expect(recs.map(r => r.toString())).toEqual(['3x10 165', '4x10 165', '5x10 165']);

		recs = userRecords.getPossibleRepsWeights('bench_press', 'endurance', Difficulty.Hard);
		expect(recs.map(r => r.toString())).toEqual(['4x13 165', '5x13 165']);

		// New exercise
		const standardRecs = userRecords.getPossibleRepsWeights('goblet_squat', 'endurance', Difficulty.Easy);
		expect(standardRecs.map(r => r.toString())).toEqual(['3x15 30']);
	});
});
