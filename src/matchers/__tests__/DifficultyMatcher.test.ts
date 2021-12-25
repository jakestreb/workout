import DifficultyMatcher from '../DifficultyMatcher';
import Exercise from '../../exercises/Exercise';
import UserRecords from '../../exercises/UserRecords';
import BodyProfile from '../../muscles/BodyProfile';
import WorkoutTarget from '../../WorkoutTarget';
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

		const seed = { difficulty: Easy, muscles: [], timeMinutes: 0 };
		const target = bodyProfile.getWorkoutTarget(seed);

		// Easy workout
		let workoutTarget = new WorkoutTarget(target, userRecords.user);
		let matcher = new DifficultyMatcher(exercises, skills, workoutTarget);
		expect(matcher.getMatch()).toEqual(
			[Hard, Easy, Intermediate, Easy]
		);

		// Intermediate workout
		workoutTarget = new WorkoutTarget({ ...target, difficulty: Intermediate }, userRecords.user);
		matcher = new DifficultyMatcher(exercises, skills, workoutTarget);
		expect(matcher.getMatch()).toEqual(
			[Hard, Easy, Intermediate, Intermediate]
		);

		// Hard workout
		workoutTarget = new WorkoutTarget({ ...target, difficulty: Hard }, userRecords.user);
		matcher = new DifficultyMatcher(exercises, skills, workoutTarget);
		expect(matcher.getMatch()).toEqual(
			[Hard, Intermediate, Hard, Intermediate]
		);
	});
});
