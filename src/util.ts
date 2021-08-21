import Workout from './Workout';

interface SelectItem {
	weight: number;
}

interface SelectResult {
	result: any;
	remaining: any[];
}

export function selectByWeight(array: SelectItem[]): SelectResult {
	const total = array.map(x => x.weight).reduce((a, b) => a + b, 0);
	const r = Math.random() * total;

	let sum = 0;
	for (let i = 0; i < array.length; i++) {
		sum += array[i].weight;
		if (r <= sum) {
			const remaining = array.slice()
			remaining.splice(i, 1);
			return {
				result: array[i],
				remaining
			};
		}
	}

	return {
		result: null,
		remaining: []
	};
}

export function printWorkout(workout: Workout): void {
	console.log('WORKOUT');
	workout.exercises.forEach(e => {
		console.log('>', {
			exercise: e.name,
			reps: e.reps.reps
		});
	});
}
