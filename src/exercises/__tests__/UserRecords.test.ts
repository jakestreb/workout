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
		sets: 1, // Note sets reduced to 1 on unfinished record
		reps: 7.8,
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

	test('getBestScores', () => {
		const score = userRecords.getBestScores('bench_press');
		expect(score).not.toBeNull();

		const { endurance, strength } = score!.round();
		expect(endurance).toEqual(1.37);
		expect(strength).toEqual(1.39);
	});

	test('getPersonalBests', async () => {
		db.records.getForUser = jest.fn().mockResolvedValue(testRecords);
		userRecords = await UserRecords.fromUserId(1);

		const personalBests = userRecords.getPersonalBests('bench_press');
		expect(personalBests).not.toBeNull();

		const { endurance, strength } = personalBests!;
		expect(`${endurance}`).toEqual('4x8 165');
		expect(`${strength}`).toEqual('1x8 230');
	});

	test('getPossibleRepsWeights', () => {
		// Strength
		let recs = userRecords.getPossibleRepsWeights('bench_press', 'strength', Difficulty.Easy);
		expect(recs.map(r => r.toString())).toEqual([
			'2x7 230', '3x7 230', '4x7 230', '5x7 230',
		]);

		recs = userRecords.getPossibleRepsWeights('bench_press', 'strength', Difficulty.Intermediate);
		expect(recs.map(r => r.toString())).toEqual([
			'2x7 235', '3x7 235', '4x7 235', '5x7 235',
		]);

		recs = userRecords.getPossibleRepsWeights('bench_press', 'strength', Difficulty.Hard);
		expect(recs.map(r => r.toString())).toEqual([
			'2x7 240', '3x7 240', '4x7 240', '5x7 240',
		]);

		// Endurance
		recs = userRecords.getPossibleRepsWeights('bench_press', 'endurance', Difficulty.Easy);
		expect(recs.map(r => r.toString())).toEqual([
			'2x7 165', '3x7 165', '4x7 165', '5x7 165',
		]);

		recs = userRecords.getPossibleRepsWeights('bench_press', 'endurance', Difficulty.Intermediate);
		expect(recs.map(r => r.toString())).toEqual([
			'2x9 165', '3x9 165', '4x9 165', '5x9 165',
		]);

		recs = userRecords.getPossibleRepsWeights('bench_press', 'endurance', Difficulty.Hard);
		expect(recs.map(r => r.toString())).toEqual([
			'2x11 165', '3x11 165', '4x11 165', '5x11 165',
		]);

		// New exercise
		const standardRecs = userRecords.getPossibleRepsWeights('goblet_squat', 'endurance', Difficulty.Easy);
		expect(standardRecs.map(r => r.toString())).toEqual([
			'2x15 30', '3x15 30', '4x15 30', '5x15 30',
		]);
	});
});
