import DifficultyMatcher from '../DifficultyMatcher';
import Exercise from '../../exercises/Exercise';
import UserRecords from '../../exercises/UserRecords';
import BodyProfile from '../../muscles/BodyProfile';
import db from '../../db';
import { Difficulty } from '../../global/enum';
import testRecords from './data/records.json';

describe('DifficultyMatcher unit test', () => {
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
		  primary_focus: 'strength',
		});
		db.records.getForUser = jest.fn().mockResolvedValue(testRecords);

		userRecords = await UserRecords.fromUserId(1);
		bodyProfile = new BodyProfile(userRecords);
	});

	test('should run successfully', () => {
		const { Easy, Intermediate, Hard } = Difficulty;
		const exercises = ['deadlift', 'bench_press', 'squat', 'barbell_row']
			.map(e => new Exercise(e));
		const skills: Skill[] = ['endurance', 'strength', 'endurance', 'strength'];
		// [3x5, 220lbs, 4x6, 200lbs]
		const matcher = new DifficultyMatcher(exercises, skills, bodyProfile);

		expect(matcher.getMatch(Easy)).toEqual(
			['Hard', 'Easy', 'Intermediate', 'Easy']
		);
		expect(matcher.getMatch(Intermediate)).toEqual(
			['Hard', 'Easy', 'Intermediate', 'Intermediate']
		);
		expect(matcher.getMatch(Hard)).toEqual(
			['Hard', 'Intermediate', 'Hard', 'Intermediate']
		);

		expect(() => matcher.getMatch()).toThrow('workoutDifficulty is required');
	});
});
