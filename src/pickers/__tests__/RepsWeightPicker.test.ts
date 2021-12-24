import Exercise from '../../exercises/Exercise';
import UserRecords from '../../exercises/UserRecords';
import BodyProfile from '../../muscles/BodyProfile';
import MuscleScores from '../../muscles/MuscleScores';
import RepsWeightPicker from '../RepsWeightPicker';
import Workout from '../../Workout';
import WorkoutTarget from '../../WorkoutTarget';
import db from '../../db';
import { Difficulty, Result, getKeys } from '../../global/enum';
import * as sampleRecords from '../../../test_data/sample_records';

const RECORDS = sampleRecords.BASIC_USER_1.slice();

interface RepsWeightArgs {
	target: IWorkoutTarget,
	userRecords: UserRecords,
	exercises: string[],
}

interface GetScoresByDifficultyArgs {
	bodyProfile: BodyProfile;
	muscles: string[];
	timeMinutes: number;
}

interface GetBestByDifficultyArgs {
	bodyProfile: BodyProfile;
	muscles: string[];
	timeMinutes: number;
	exercises: string[];
}

function makeRepsWeightPicker(args: RepsWeightArgs) {
	const { target, userRecords, exercises: exerciseNames } = args;
	const exercises = exerciseNames.map(s => new Exercise(s));
	const workoutTarget = new WorkoutTarget(target);
	return new RepsWeightPicker(exercises, workoutTarget, userRecords);
}

function getBestPick(picker: RepsWeightPicker) {
	const gen = picker.pick();
	let curr = gen.next();
	while (!curr.done) {
		curr = gen.next();
	}
	return curr.value;
}

function getScoresByDifficulty(args: GetScoresByDifficultyArgs) {
	const { bodyProfile, muscles, timeMinutes } = args;
	const result: { [difficulty: string]: IMuscleScores } = {};
	getKeys(Difficulty).forEach(difficulty => {
		const target = bodyProfile.getWorkoutTarget({ difficulty, muscles, timeMinutes });
      	const name = Difficulty[difficulty];
		result[name] = target.scores;
	});
	return result;
}

function getBestByDifficulty(args: GetBestByDifficultyArgs) {
	const { bodyProfile, muscles, timeMinutes, exercises } = args;
	const result: { [difficulty: string]: string } = {};
	getKeys(Difficulty).forEach(difficulty => {
		const target = bodyProfile.getWorkoutTarget({ difficulty, muscles, timeMinutes });
      	const picker = makeRepsWeightPicker({
      		target,
      		userRecords: bodyProfile.userRecords,
      		exercises
      	});
      	const sets = getBestPick(picker);
      	const name = Difficulty[difficulty];
		result[name] = sets!.map(s => s.repsWeight).join(', ');
	});
	return result;
}

describe('RepsWeightPicker unit test', () => {
	let user: DBUser;
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
		db.records.getForUser = jest.fn().mockResolvedValue(RECORDS);

		userRecords = await UserRecords.fromUserId(1);
		user = userRecords.user;
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
			userRecords: bodyProfile.userRecords,
			exercises,
		});

		const gen = picker.pick();
		let curr = gen.next();
		let bestDist = RepsWeightPicker.MAX_AVG_DIST;

		while (!curr.done) {
			const sets = curr.value;
			expect(sets).not.toBeNull();

			const scores = MuscleScores.combineExerciseScores(
				...sets!.map(s => s.getFocusScores(user))
			);
			const dist = workoutTarget.avgScoreDistance(scores);

			expect(workoutTarget.checkTime(new Workout(sets!).time)).toEqual(Result.Complete);
			if (dist < bestDist) {
				bestDist = dist;
			}
			curr = gen.next();
		}

		const sets = curr.value;
		expect(sets).not.toBeNull();
		expect(workoutTarget.checkTime(new Workout(sets!).time)).toEqual(Result.Complete);

		const scores = MuscleScores.combineExerciseScores(...sets!.map(s => s.getFocusScores(user)));
		const dist = workoutTarget.avgScoreDistance(scores);
		expect(dist).toEqual(bestDist);
	});

	test.only('pick 2', () => {
		const muscles = ['glutes', 'calves'];
		const timeMinutes = 10;

		// const scoresByDifficulty = getScoresByDifficulty({ bodyProfile, muscles, timeMinutes });

		// expect(scoresByDifficulty).toEqual({
		// 	Easy: {
  //       		glutes: { endurance: 1.6, strength: 1.17 },
		//         calves: { endurance: 2.4, strength: 1.97 },
		// 	},
		// 	Intermediate: {
  //       		glutes: { endurance: 1.6, strength: 1.17 },
		//         calves: { endurance: 2.4, strength: 1.97 },
		// 	},
		// 	Hard: {
  //       		glutes: { endurance: 2.13, strength: 1.56 },
		//         calves: { endurance: 3.2, strength: 2.63 },
		// 	},
		// });

		const exercises = ['squat', 'standing_barbell_calf_raises'];

		const bestByDifficulty = getBestByDifficulty({
			bodyProfile, muscles, timeMinutes, exercises
		});

		// TODO: Current problem is either/or endurance/strength focus in selections?
		expect(bestByDifficulty).toEqual({
			Easy: '3x6 275, 4x8 115',
			Intermediate: '3x6 275, 4x8 115',
			Hard: '3x6 275, 4x8 115',
		});
	});

	test.skip('pick 3', () => {
		const muscles = ['middle_chest', 'glutes', 'calves'];
		const timeMinutes = 18;

		const scoresByDifficulty = getScoresByDifficulty({ bodyProfile, muscles, timeMinutes });

		expect(scoresByDifficulty).toEqual({
			Easy: {
        		glutes: { endurance: 1.6, strength: 1.17 },
		        calves: { endurance: 2.4, strength: 1.97 },
		        middle_chest: { endurance: 2.4, strength: 1.97 },
			},
			Intermediate: {
        		glutes: { endurance: 1.6, strength: 1.17 },
		        calves: { endurance: 2.4, strength: 1.97 },
		        middle_chest: { endurance: 2.4, strength: 1.97 },
			},
			Advanced: {
        		glutes: { endurance: 2.13, strength: 1.56 },
		        calves: { endurance: 3.2, strength: 2.63 },
		        middle_chest: { endurance: 2.4, strength: 1.97 },
			},
		});

		const exercises = ['bench_press', 'squat', 'standing_barbell_calf_raises'];

		const bestByDifficulty = getBestByDifficulty({
			bodyProfile, muscles, timeMinutes, exercises
		});

		expect(bestByDifficulty).toEqual({
			Easy: '3x6 275, 4x8 115, 0x0 0',
			Intermediate: '3x6 275, 4x8 115, 0x0 0',
			Advanced: '3x6 275, 4x8 115, 0x0 0',
		});
	});
});
