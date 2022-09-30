import Exercise from '../../exercises/Exercise';
import UserRecords from '../../exercises/UserRecords';
import BodyProfile from '../../muscles/BodyProfile';
import RepsWeightPicker from '../RepsWeightPicker';
import Workout from '../../Workout';
import WorkoutTarget from '../../WorkoutTarget';
import db from '../../db';
import { Difficulty, Result } from '../../global/enum';
import testRecords from './data/records.json';

interface RepsWeightPickerArgs {
	target: IWorkoutTarget,
	userRecords: UserRecords,
	exercises: string[],
}

function makeRepsWeightPicker(args: RepsWeightPickerArgs) {
	const { target, userRecords, exercises: exerciseNames } = args;
	const exercises = exerciseNames.map(s => new Exercise(s));
	const workoutTarget = new WorkoutTarget(target);
	return new RepsWeightPicker(exercises, workoutTarget, userRecords);
}

describe('RepsWeightPicker unit test', () => {
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

	test('should run successfully', () => {
		const exercises = ['squat', 'standing_barbell_calf_raises'];
		const target = bodyProfile.getWorkoutTarget({
			difficulty: Difficulty.Intermediate,
			muscles: ['glutes', 'calves'],
			timeMinutes: 10,
		});
		const workoutTarget = new WorkoutTarget(target);

		const picker = makeRepsWeightPicker({
			target,
			userRecords,
			exercises,
		});

		const gen = picker.pick();
		let curr = gen.next();

		while (!curr.done) {
			const sets = curr.value;
			expect(sets).not.toBeNull();
			expect(workoutTarget.checkTime(new Workout(sets!).time)).toEqual(Result.Complete);

			curr = gen.next();
		}
		expect(curr.done).toEqual(true);
	});
});
