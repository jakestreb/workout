import UserRecords from '../UserRecords';
import db from '../../db';
import testRecords from './data/records.json';

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
		reps: 3.84,
		weight: 227.95,
		completed: false,
		created_at: '2021-11-08T16:49:35.220Z',
	},
	{
		user_id: 1,
		workout_id: '1',
		exercise: 'bench_press',
		sets: 4,
		reps: 7.51,
		weight: 149.48,
		completed: true,
		created_at: '2021-05-08T16:49:35.220Z',
	},
];

describe('UserRecords unit test', () => {

	let userRecords: UserRecords;

	beforeAll(async () => {
		await db.init();

		db.users.getOne = jest.fn().mockResolvedValue({
		  id: 1,
		  name: 'Jake',
		  gender: 'male',
		  weight: 180,
		  experience: 'advanced',
		  primary_focus: 'strength',
		});
		db.records.getForUser = jest.fn().mockResolvedValue(testRecords);

		userRecords = await UserRecords.fromUserId(1);
	});

	test('getRecords', () => {
		expect(userRecords.getRecords('bench_press'))
			.toEqual(BENCH_PRESS_RECORDS);
	});

	test('getAdjustedRecords', () => {
		expect(userRecords.getAdjustedRecords('bench_press'))
			.toEqual(ADJUSTED_BENCH_PRESS_RECORDS);
	});

	test('getPersonalBests', () => {
		const personalBests = userRecords.getPersonalBests('bench_press');
		expect(personalBests).not.toBeNull();

		const { endurance, strength } = personalBests!;
		expect(`${endurance}`).toEqual('4x8 150');
		expect(`${strength}`).toEqual('4x6 225');
	});

	test('getBestScores', () => {
		const score = userRecords.getBestScores('bench_press');
		expect(score).not.toBeNull();

		const { endurance, strength } = score!.round();
		expect(endurance).toEqual(0.98);
		expect(strength).toEqual(1.24);
	});

	test('getRecommendations', () => {
		const recs = userRecords.getRecommendations('bench_press');
		expect(recs.map(r => r.toString())).toEqual(['4x6 225', '4x8 150']);

		const standardRecs = userRecords.getRecommendations('goblet_squat');
		expect(standardRecs.map(r => r.toString())).toEqual(['3x15 30']);
	});
});
