
import TargetTracker from './TargetTracker';
import WorkoutPattern from './WorkoutPattern';

export interface Target {
  muscle: string;
  desiredWeight: number;
  currentWeight: number;
}

export default class Workout {
  public static* generator(targetName: string, intensity: number, timeMinutes: number) {
  	// Create target tracker
    const targetTracker = new TargetTracker(targetName, intensity, timeMinutes);

    const workoutPatternGenerator = WorkoutPattern.generator(targetTracker);
    let currWorkoutPattern = workoutPatternGenerator.next();
    while (!currWorkoutPattern.done) {
      yield new Workout(currWorkoutPattern.value);
      currWorkoutPattern = workoutPatternGenerator.next();
    }
    throw new Error('Out of options');
  }

  constructor(
  	public workoutPattern: WorkoutPattern,
  ) {
    console.log('new workout ->', workoutPattern);
  }
}
