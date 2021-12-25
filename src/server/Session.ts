import UserRecords from '../exercises/UserRecords';
import MultiGenerator from '../generators/MultiGenerator';
import BodyProfile from '../muscles/BodyProfile';
import Workout from '../Workout';
import targetRecords from '../data/raw/targets.json';
import { Difficulty } from '../global/enum';
import * as util from '../global/util';

export default class Session {

	public bodyProfile: BodyProfile;
	public user: DBUser;

	public multiGenerator: MultiGenerator;

	public gen: Generator<Workout|null>|null;

	public static async create(userId: number) {
		const userRecords = await UserRecords.fromUserId(userId);
		return new Session(userRecords);
	}

	constructor(userRecords: UserRecords) {
		this.bodyProfile = new BodyProfile(userRecords);
		this.user = userRecords.user;
	}

	// TODO: Name should be removed once there is a workout picker
	public async startGenerator(name: string, difficulty: Difficulty, timeMinutes: number): Promise<number> {
		console.log(`Starting generator: ${name}, difficulty: ${difficulty}, time: ${timeMinutes}m`);

		// TODO: Add workout picker
		const targetRecord  = targetRecords.find(t => t.name === name);
		if (!targetRecord) { throw new Error('Target not found'); }

		const totalWeight = util.sum(targetRecord.phases.map(phase => phase.weight));

		const targets = targetRecord.phases.map(phase =>
			this.bodyProfile.getWorkoutTarget({
				difficulty,
				muscles: phase.muscles,
				timeMinutes: timeMinutes * (phase.weight / totalWeight)
			})
		);

		this.multiGenerator = new MultiGenerator(targets, this.user.id!);
		this.gen = this.multiGenerator.generate();
		return this.multiGenerator.workoutGenerators.length;
	}

	public async stopGenerator(): Promise<void> {
		if (!this.gen) {
			throw new Error('Generator not started');
		}
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

	public async getProgress(): Promise<GeneratorProgress[]> {
		if (!this.gen) {
			throw new Error('Generator not started');
		}
		return this.multiGenerator.workoutGenerators.map(wg => ({
			generated: wg.generatedCount,
			filtered: wg.filteredCount,
			isDone: wg.isDone,
		}));
	}
}
