import Workout from './src/Workout';

function printWorkout(workout: Workout) {
	console.log('->', workout.exercises);
}

let i = 0;

for (const workout of Workout.generator('chest_day', 50, 60)) {
	printWorkout(workout);
	if (i > 2) {
		break;
	}
	i++;
}
console.log('done');
