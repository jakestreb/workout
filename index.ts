import LookaheadGenerator from './src/generators/LookaheadGenerator';
import WorkoutTerminal from './src/terminal/WorkoutTerminal';
import * as util from './src/global/util';

let started = false;
let done = false;

const t = new WorkoutTerminal(['Kelci', 'Michael', 'Vini', 'Jake', 'Yudhi']);

const wg = new LookaheadGenerator({
	name: 'back_day',
	intensity: 6,
	timeMinutes: 30
});

wg.start();
wg.on('done', () => {
	done = true;
});

const gen = wg.generate();

process.stdin.setRawMode!(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', async (key) => {
	if (key === '\u0003') { // ctrl-c
		wg.kill();
		t.kill();
		process.exit();
	} else if (key === 'g') {
		started = true;
		const curr = await gen.next(t.locked);
		if (curr.done) {
			process.exit();
		}
		if (curr.value) {
			t.update(curr.value);
			t.updateGeneratedCounts(wg.generatedCount, wg.filteredCount);
		}
	}
});

util.forever(() => {
	if (started) {
		t.updateGeneratedCounts(wg.generatedCount, wg.filteredCount);
	}
	if (done) {
		return true;
	}
}, 100);

console.log('> "g" to generate');
