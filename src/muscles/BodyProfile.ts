import Exercise from '../exercises/Exercise';
import UserRecords from '../exercises/UserRecords';
import MuscleScores from './MuscleScores';
import Score from './Score';
import data from '../data';

export default class BodyProfile {

	public readonly userRecords: UserRecords;
	public readonly user: DBUser;

	private _scores: MuscleScores = new MuscleScores();
	private _goal: Score;
	private _distances: MuscleScores = new MuscleScores();

	constructor(userRecords: UserRecords) {
		this.userRecords = userRecords;
		this.user = userRecords.user;

		this._init();
	}

	public getWorkoutTarget(seed: IWorkoutSeed): IWorkoutTarget {
		const focusMuscleGoals = new MuscleScores();

		seed.muscles.forEach(m => {
			focusMuscleGoals.set(m, this._distances.get(m));
		});

		return {
			muscleGoals: this._distances.getMap(),
			focusMuscleGoals: focusMuscleGoals.getMap(),
			enduranceRatio: this.getStandardEnduranceRatio(),
			difficulty: seed.difficulty,
			timeMinutes: seed.timeMinutes,
		};
	}

	public getStandardEnduranceRatio(): number {
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

	public getGoalDiscrepancies(): MuscleScores {
		return this._distances.copy();
	}

	private _init() {
		const allExercises = data.exercises.all().map(e => new Exercise(e.name));
		const allScores = allExercises.map(e => this.userRecords.getBestScores(e.name));

		const exercises = allExercises.filter((e, i) => allScores[i]);
		const exerciseScores = allScores.filter(s => s) as Score[];

		// Init muscle scores
		exercises.forEach((exercise, i) => {
			const exerciseScore = exerciseScores[i];
			// const { muscleScoreFactors } = exercise;
			exercise.muscles.forEach(m => {
				const exerciseWeight = exercise.muscleActivity[m];
				// Weight exercise scores by ratio of muscle use across exercises
				this._scores.avgIn(m, exerciseScore, exerciseWeight);
			});
		});
		this._scores = this._scores.round();

		this._goal = this._scores.getPercentile(.75);

		this._scores.keys.forEach(m => {
			this._distances.set(m, this._goal.divideBy(this._scores.get(m)));
		});
		this._distances = this._distances.round();
	}
}
