import WorkoutGenerator from './src/generators/WorkoutGenerator';
import WorkoutTerminal from './src/terminal/WorkoutTerminal';
import * as util from './src/global/util';

let started = false;
let done = false;

const wg = new WorkoutGenerator({
	name: 'back_day',
	intensity: 6,
	timeMinutes: 30
});

const gen = wg.generate();

const t = new WorkoutTerminal(['Kelci', 'Michael', 'Vini', 'Jake', 'Yudhi']);

// wg.on('done', () => {
// 	done = true;
// });

t.on('lock', (locked) => {
	wg.hold(locked);
});

process.stdin.setRawMode!(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', async (key) => {
	if (key === '\u0003') { // ctrl-c
		wg.kill();
		t.kill();
		process.exit();
	} else if (key === 'g') {
		const curr = await gen.next();
		if (curr.done) {
			process.exit();
		}
		if (curr.value) {
			t.update(curr.value);
			t.updateGeneratedCounts(wg.generatedCount, wg.filteredCount, done);
		}
		started = true;
	}
});

util.forever(() => {
	if (started) {
		t.updateGeneratedCounts(wg.generatedCount, wg.filteredCount, done);
	}
}, 500);

console.log('> "g" to generate');
