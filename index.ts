import * as readline from 'readline';
import Workout from './src/Workout';

readline.emitKeypressEvents(process.stdin);

let count = 0;
const gen = Workout.generator('chest_day', 5, 30);

// process.stdin.on('keypress', (str, key) => {
// 	if (key.name === 'enter') {
// 		const curr = gen.next();
// 		console.log(`${curr.value}`);
// 		if (curr.done) {
// 			process.exit(0);
// 		}
// 	}
// });
// console.log('ENTER to generate');

while (true) {
	count += 1;
	const curr = gen.next();
	console.log(count);
	console.log(`${curr.value}`);
	if (curr.done) {
		process.exit(0);
	}
}
