import RecordManager from '../data/RecordManager';
import WorkoutGenerator from '../generators/WorkoutGenerator';
import Workout from '../Workout';

export default class Session {

	public userId: number;

	public recordManager: RecordManager;
	public workoutGenerator: WorkoutGenerator;

	public lastGen: AsyncGenerator<Workout>;

	constructor(userId: number, recordManager: RecordManager) {
		this.userId = userId;
		this.recordManager = recordManager;
	}

	public async getNextWorkout({ intensity, timeMinutes }: any): Promise<Workout> {
		if (!this.workoutGenerator) {
			this.workoutGenerator = new WorkoutGenerator({ intensity, timeMinutes });
		}
		if (!this.lastGen) {
			this.lastGen = this.workoutGenerator.generate();
		}
		const result = await this.lastGen.next();
		return result.value;
	}
}
