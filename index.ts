import Workout from './src/Workout';

let i = 0;

const workoutGenerator = Workout.generator('chest_day', 50, 60);
let currWorkout = workoutGenerator.next();
while (!currWorkout.done || i < 2) {
  console.warn('WORKOUT >', currWorkout.value);
  currWorkout = workoutGenerator.next();
  i++;
}

console.warn('done');
