import * as readline from 'readline';
import LookaheadGenerator from './src/generators/LookaheadGenerator';

readline.emitKeypressEvents(process.stdin);

const wg = new LookaheadGenerator({
	name: 'back_day',
	intensity: 7,
	timeMinutes: 30
});

const gen = wg.lookaheadGenerate();

process.stdin.on('keypress', async (str, key) => {
	if (key.name === 'enter') {
		const curr = await gen.next();
		console.log(`${curr.value}`);
		if (curr.done) {
			process.exit(0);
		}
	}
});

console.log('ENTER to generate');
