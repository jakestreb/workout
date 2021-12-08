import Exercise from '../exercises/Exercise';
import UserRecords from '../exercises/UserRecords';
import MuscleScores from './MuscleScores';
import Score from './Score';
import data from '../data';

export default class BodyProfile {

	public static TARGET_DIFFICULTY_RATIOS = [0.7, 0.9, 1.1];
	public static AVG_WORKOUT_TIME = 60;

	public static MIN_GOAL = 5;

	public readonly userRecords: UserRecords;
	public readonly user: DBUser;

	private readonly _scores: MuscleScores;
	private readonly _goalScores: MuscleScores;

	constructor(userRecords: UserRecords) {
		this.userRecords = userRecords;
		this.user = userRecords.user;

		this._init();
	}

	public getWorkoutTarget(seed: IWorkoutSeed): IWorkoutTarget {
		const minScores: IMuscleScores = {};
		const timeRatio = seed.timeMinutes / BodyProfile.AVG_WORKOUT_TIME;
		const difficultyRatio = BodyProfile.TARGET_DIFFICULTY_RATIOS[seed.difficulty];

		const getMinReq = (x: number) => Math.max(x, 0) * difficultyRatio * timeRatio;

		seed.muscles.forEach(m => {
			const delta = this.getGoalDiscrepancy(m);
			minScores[m] = {
				endurance: getMinReq(delta.endurance),
				strength: getMinReq(delta.strength),
			};
		});

		return {
			minScores,
			timeMinutes: seed.timeMinutes,
		};
	}

	public getGoalDiscrepancy(m: string): Score {
		return this._goalScores.get(m).copy().subtract(this._scores.get(m));
	}

	private _init() {
		const allExercises = data.exercises.all().map(e => new Exercise(e));
		const allScores = allExercises.map(exercise => this.userRecords.getBestScores(exercise));

		const exercises = allExercises.filter((e, i) => allScores[i]);
		const exerciseScores = allScores.filter(s => s) as Score[];

		// Sums of strength/endurance exercise type weights over each muscle
		const muscleSkillSums = initScoreMap();
		exercises.forEach((exercise, i) => {
			exercise.muscles.forEach(m => {
				muscleSkillSums[m].add(new Score(exercise.skills));
			});
		});

		// Init muscle scores
		exercises.forEach((exercise, i) => {
			const exerciseScore = exerciseScores[i];
			const { scoresPerRep } = exercise;
			exercise.muscles.forEach(m => {
				const muscleFactor = scoresPerRep.getRatio(m);
				const skillFactor = new Score(exercise.skills)
					.divideBy(muscleSkillSums[m]);
				const muscleScore = exerciseScore
					.multiply(muscleFactor)
					.multiply(skillFactor);
				this._scores.add(m, muscleScore);
			});
		});

		// TODO: Save goals to db, allow users to modify
		// Init goal muscle scores
		const allMuscles = data.muscles.componentNames;
		const relativeScores = allMuscles
			.map(m => {
				const score = this._scores.get(m);
				return score.copy().subtract(data.muscles.getDefaultScore(m));
			});

		const lowScores = Score.getPercentileScores(.25, ...relativeScores);
		const goalScores = Score.getPercentileScores(.75, ...relativeScores);
		const range = goalScores.copy().subtract(lowScores);

		const { primary_focus: primaryFocus } = this.userRecords.user;
		if (range[primaryFocus] < BodyProfile.MIN_GOAL) {
			goalScores[primaryFocus] = lowScores[primaryFocus] + BodyProfile.MIN_GOAL;
		}

		allMuscles.forEach((m, i) => {
			const toReachGoal = goalScores.copy().subtract(relativeScores[i]);
			toReachGoal.strength = Math.max(toReachGoal.strength, 0);
			toReachGoal.endurance = Math.max(toReachGoal.endurance, 0);
			this._goalScores.set(m, this._scores.get(m).copy().add(toReachGoal));
		});
	}
}

function initScoreMap(): {[muscle: string]: Score} {
	const ret: {[muscle: string]: Score} = {};
	data.muscles.names.forEach(m => { ret[m] = new Score(); });
	return ret;
}
