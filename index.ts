import * as readline from 'readline';
import WorkoutGenerator from './src/WorkoutGenerator';

readline.emitKeypressEvents(process.stdin);

const wg = new WorkoutGenerator('chest_day', 7, 30);
const gen = wg.generate();

process.stdin.on('keypress', (str, key) => {
	if (key.name === 'enter') {
		const curr = gen.next();
		console.log(`${curr.value}`);
		if (curr.done) {
			process.exit(0);
		}
	}
});

console.log('ENTER to generate');

// let count = 0;
// while (true) {
// 	count += 1;
// 	const curr = gen.next();
// 	console.log(count);
// 	console.log(`${curr.value}`);
// 	if (curr.done) {
// 		process.exit(0);
// 	}
// }
