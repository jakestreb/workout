import Exercise from '../exercises/Exercise';
import UserRecords from '../exercises/UserRecords';
import MuscleScores from './MuscleScores';
import Score from './Score';
import data from '../data';

export default class BodyProfile {

	public static TARGET_DIFFICULTY_MEANS = [3, 4.5, 6];
	public static TARGET_STD_DEV = 1;
	public static STANDARD_WORKOUT_TIME = 60;

	public static MIN_GOAL_FACTOR = 1.10;

	public readonly userRecords: UserRecords;
	public readonly user: DBUser;

	private readonly _scores: MuscleScores = new MuscleScores();
	private _goal: Score;

	constructor(userRecords: UserRecords) {
		this.userRecords = userRecords;
		this.user = userRecords.user;

		this._init();
	}

	public getWorkoutTarget(seed: IWorkoutSeed): IWorkoutTarget {
		const minScores = new MuscleScores();
		const timeRatio = seed.timeMinutes / BodyProfile.STANDARD_WORKOUT_TIME;
		const mean = BodyProfile.TARGET_DIFFICULTY_MEANS[seed.difficulty];

		seed.muscles.forEach(m => {
			minScores.set(m, this.getGoalDiscrepancy(m));
		});

		const scaled = minScores.scale(mean * timeRatio, BodyProfile.TARGET_STD_DEV);

		return {
			minScores: scaled.round().getMap(),
			timeMinutes: seed.timeMinutes,
		};
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

		const lowScore = this._scores.getPercentile(.25);
		this._goal = this._scores.getPercentile(.75);

		// Ensure goal is sufficiently high
		const { primary_focus: primaryFocus } = this.userRecords.user;
		if (this._goal[primaryFocus] / lowScore[primaryFocus] < BodyProfile.MIN_GOAL_FACTOR) {
			this._goal[primaryFocus] = lowScore[primaryFocus] * BodyProfile.MIN_GOAL_FACTOR;
		}
	}
}
