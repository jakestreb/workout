import RecordManager from '../data/RecordManager';
import MultiGenerator from '../generators/MultiGenerator';
import Workout from '../Workout';

export default class Session {

	public userId: number;

	public recordManager: RecordManager;
	public multiGenerator: MultiGenerator;

	public gen: Generator<Workout|null>|null;

	constructor(userId: number, recordManager: RecordManager) {
		this.userId = userId;
		this.recordManager = recordManager;
	}

	public async startGenerator({ name, intensity, timeMinutes }: any): Promise<number> {
		console.log(`Starting generator: ${name}, intensity: ${intensity}, time: ${timeMinutes}`);
		this.multiGenerator = new MultiGenerator({ name, intensity, timeMinutes });
		this.gen = this.multiGenerator.generate();
		return this.multiGenerator.workoutGenerators.length;
	}

	public async stopGenerator(): Promise<void> {
		this.multiGenerator.killAll();
		this.gen = null;
	}

	public getNextWorkout(index: number, hold: string[]): Promise<Workout> {
		if (!this.gen) {
			throw new Error('Generator not started');
		}
		const { value } = this.gen.next(index);
		return value;
	}

	public async getProgress(index: number): Promise<GeneratorProgress> {
		const wg = this.multiGenerator.workoutGenerators[index];
		return {
			generated: wg.generatedCount,
			filtered: wg.filteredCount,
			isDone: wg.isDone,
		};
	}
}
