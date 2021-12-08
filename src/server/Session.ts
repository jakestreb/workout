import BodyProfile from '../muscles/BodyProfile';
import MultiGenerator from '../generators/MultiGenerator';
import Workout from '../Workout';
import db from '../db';
import targetRecords from '../data/raw/targets.json';
import * as util from '../global/util';

export default class Session {

	public bodyProfile: BodyProfile;

	public multiGenerator: MultiGenerator;

	public gen: Generator<Workout|null>|null;

	public static async create(userId: number) {
		const user = await db.users.getOne(userId);
		const records = await db.records.getForUser(userId);
		return new Session(user, records);
	}

	constructor(user: DBUser, records: DBRecord[]) {
		this.bodyProfile = new BodyProfile(user, records);
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

		this.multiGenerator = new MultiGenerator(targets);
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
