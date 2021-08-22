import Workout from './src/Workout';

function printWorkout(workout: Workout) {
	console.log('->', workout.exercises);
}

for (const workout of Workout.generator('chest_day', 5, 30)) {
	printWorkout(workout);
	break;
}
console.log('done');
