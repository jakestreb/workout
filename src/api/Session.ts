import RecordManager from '../data/RecordManager';
import WorkoutGenerator from '../generators/WorkoutGenerator';
import Workout from '../Workout';

export default class Session {

	public userId: number;

	public recordManager: RecordManager;
	public workoutGenerator: WorkoutGenerator;

	public gen: Generator<Workout|null>|null;

	constructor(userId: number, recordManager: RecordManager) {
		this.userId = userId;
		this.recordManager = recordManager;
	}

	public async startGenerator({ name, intensity, timeMinutes }: any): Promise<void> {
		this.workoutGenerator = new WorkoutGenerator({ name, intensity, timeMinutes });
		this.gen = this.workoutGenerator.lookaheadGenerate();
	}

	public async stopGenerator(): Promise<void> {
		this.workoutGenerator.kill();
		this.gen = null;
	}

	public getNextWorkout(hold: string[]): Promise<Workout> {
		if (!this.gen) {
			throw new Error('Generator not started');
		}
		const { value } = this.gen.next();
		return value;
	}

	public async getProgress(): Promise<GeneratorProgress> {
		return {
			generated: this.workoutGenerator.generatedCount,
			filtered: this.workoutGenerator.filteredCount,
			isDone: this.workoutGenerator.isDone,
		};
	}
}
