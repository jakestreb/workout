import Workout from './src/Workout';
import * as util from './src/util';

let i = 0;

const workoutGenerator = Workout.generator('chest_day', 50, 60);
let currWorkout = workoutGenerator.next();
while (!currWorkout.done && i < 1) {
  util.printWorkout(currWorkout.value);
  currWorkout = workoutGenerator.next();
  i++;
}

console.warn('done');
