import SkillMatcher from '../SkillMatcher';
import Exercise from '../../exercises/Exercise';
import UserRecords from '../../exercises/UserRecords';
import BodyProfile from '../../muscles/BodyProfile';
import db from '../../db';
import testRecords from './data/records.json';

describe('SkillMatcher unit test', () => {
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
		const exercises = ['deadlift', 'bench_press', 'squat', 'barbell_row']
			.map(e => new Exercise(e));
		const matcher = new SkillMatcher(exercises, bodyProfile);
		expect(matcher.getMatch()).toEqual(['endurance', 'strength', 'endurance', 'strength']);
	});
});
