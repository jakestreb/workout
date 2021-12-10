import UserRecords from '../exercises/UserRecords';
import ExercisePicker from '../pickers/ExercisePicker';
import RepPicker from '../pickers/RepPicker';
import LookaheadGenerator from './LookaheadGenerator';
import Workout from '../Workout';
import WorkoutTarget from '../WorkoutTarget';

export default class WorkoutGenerator extends LookaheadGenerator {

	public target: WorkoutTarget;
	public userId: number;

	constructor(target: IWorkoutTarget, userId: number) {
		super(target, userId);
		this.target = new WorkoutTarget(target);
		this.userId = userId;
	}

	public async* generate(): AsyncGenerator<Workout> {
		const userRecords = await UserRecords.fromUserId(this.userId);
		const exercisePicker = new ExercisePicker(this.target);

		for (const exercises of exercisePicker.pick()) {
			const repPicker = new RepPicker(exercises!, this.target, userRecords);
			for (const sets of repPicker.pick()) {
				yield new Workout(sets!);
				break;
			}
		}
	}
}
