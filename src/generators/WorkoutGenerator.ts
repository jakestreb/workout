import BodyProfile from '../muscles/BodyProfile';
import ExercisePicker from '../pickers/ExercisePicker';
import LookaheadGenerator from './LookaheadGenerator';
import Workout from '../Workout';
import WorkoutTarget from '../WorkoutTarget';
import RepPicker from '../pickers/RepPicker';
import db from '../db';

export default class WorkoutGenerator extends LookaheadGenerator {

	public target: WorkoutTarget;
	public bodyProfile: BodyProfile;

	public static async create(target: IWorkoutTarget, userId: number): Promise<WorkoutGenerator> {
		const [user, records] = await Promise.all([
			db.users.getOne(userId),
			db.records.getForUser(userId)
		]);
		return new WorkoutGenerator(target, new BodyProfile(user, records));
	}

	constructor(target: IWorkoutTarget, bodyProfile: BodyProfile) {
		super(target);
		this.target = new WorkoutTarget(target);
		this.bodyProfile = bodyProfile;
	}

	public* generate(): Generator<Workout> {
		const exercisePicker = new ExercisePicker(this.target, this.bodyProfile);

		for (const exercises of exercisePicker.pick()) {
			const repPicker = new RepPicker(exercises!, this.target, this.bodyProfile);
			for (const sets of repPicker.pick()) {
				yield new Workout(sets!);
				break;
			}
		}
	}
}
