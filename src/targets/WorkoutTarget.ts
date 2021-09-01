import MuscleActivity from '../MuscleActivity';
import MuscleActivityTarget from './MuscleActivityTarget';
import { Result } from '../enums';

export default class WorkoutTarget {

	public static maxLeftoverTime: number = 5 * 60;

	public muscleActivityTarget: MuscleActivityTarget;
	public timeTarget: number;

	constructor(targetName: string, intensity: number, timeSeconds: number) {
		this.muscleActivityTarget = MuscleActivityTarget.fromTarget(targetName, intensity, timeSeconds);
		this.timeTarget = timeSeconds;
	}

	public checkSingleFocus(muscleActivity: MuscleActivity): boolean {
		return this.muscleActivityTarget.allows(muscleActivity) && this.muscleActivityTarget.overlaps(muscleActivity);
	}

	// Checks that the focus is in the right muscles
	public checkFocusMuscles(muscleActivity: MuscleActivity): boolean {
		return this.muscleActivityTarget.hasSameMuscles(muscleActivity);
	}

	// Checks that the focus is in the right muscles and is the right magnitude
	public checkFocus(muscleActivity: MuscleActivity): boolean {
		return this.muscleActivityTarget.isSatisfiedBy(muscleActivity);
	}

	public checkTime(time: number, tolerance: number = 0): Result {
		const minTime = this.timeTarget - WorkoutTarget.maxLeftoverTime - tolerance;
		const maxTime = this.timeTarget + tolerance;

		if (time < minTime) {
			return Result.Incomplete;
		} else if (time >= minTime && time <= maxTime) {
			return Result.Complete;
		}
		return Result.Failed;
	}
}
