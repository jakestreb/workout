import Exercise from '../exercises/Exercise';
import UserRecords from '../exercises/UserRecords';
import MuscleScores from './MuscleScores';
import Score from './Score';
import data from '../data';

export default class BodyProfile {

	// new!!!!!
	// Fractions represent a scale of the personal best reps weight selections
	// for each muscle
	// public static PRIMARY_MEANS = [0.7, 0.85, 1];
	// public static STD_DEV_FACTOR = 0.2;

	// old!!!!
	// public static TARGET_MEANS = [8, 12, 16];
	// public static TARGET_STD_DEV_FACTOR = 0.2;
	// public static STANDARD_WORKOUT_TIME = 60;

	// public static MIN_GOAL_FACTOR = 1.05;

	public readonly userRecords: UserRecords;
	public readonly user: DBUser;

	private readonly _scores: MuscleScores = new MuscleScores();
	private _goal: Score;

	constructor(userRecords: UserRecords) {
		this.userRecords = userRecords;
		this.user = userRecords.user;

		this._init();
	}

	// TODO: Remove
	// public getWorkoutTarget(seed: IWorkoutSeed): IWorkoutTarget {
	// 	const targetScores = new MuscleScores();
	// 	const timeRatio = seed.timeMinutes / BodyProfile.STANDARD_WORKOUT_TIME;
	// 	const mean = BodyProfile.PRIMARY_MEANS[seed.difficulty] * timeRatio;

	// 	seed.muscles.forEach(m => {
	// 		targetScores.set(m, this.getGoalDiscrepancy(m));
	// 	});

	// 	const scaled = targetScores.scale(mean, mean * BodyProfile.STD_DEV_FACTOR);

	// 	return {
	// 		scores: scaled.zeroFloor().round().getMap(),
	// 		timeMinutes: seed.timeMinutes,
	// 	};
	// }

	public getWorkoutEnduranceRatio(): number {
		// TODO: Allow user customization
		return 0.5;
	}

	public getMuscleScores(): MuscleScores {
		return this._scores.copy();
	}

	public getMuscleScore(m: string): Score {
		return this._scores.get(m).copy();
	}

	public getGoalScore(): Score {
		return this._goal.copy();
	}

	public getGoalDiscrepancy(m: string): Score {
		const { strength, endurance } = this._goal.subtract(this._scores.get(m));
		return new Score({
			strength: Math.max(strength, 0),
			endurance: Math.max(endurance, 0),
		});
	}

	private _init() {
		const allExercises = data.exercises.all().map(e => new Exercise(e.name));
		const allScores = allExercises.map(e => this.userRecords.getBestScores(e.name));

		const exercises = allExercises.filter((e, i) => allScores[i]);
		const exerciseScores = allScores.filter(s => s) as Score[];

		// Sums of total muscle activity (score factors) per muscle across exercises
		const muscleFactorSums = MuscleScores.combine(
			...exercises.map(e => e.muscleScoreFactors)
		);

		// Init muscle scores
		exercises.forEach((exercise, i) => {
			const exerciseScore = exerciseScores[i];
			const { muscleScoreFactors } = exercise;
			exercise.muscles.forEach(m => {
				const muscleFactor = muscleScoreFactors.get(m);
				const muscleSum = muscleFactorSums.get(m);
				const muscleRatio = muscleFactor.divideBy(muscleSum);
				// Weight exercise scores by ratio of muscle use across exercises
				this._scores.add(m, exerciseScore.multiply(muscleRatio));
			});
		});

		this._goal = this._scores.getPercentile(.75);
	}
}
