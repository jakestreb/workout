import PhaseGenerator from './PhaseGenerator';
import * as util from '../global/util';

process.on('message', (target) => {
	const bg = new PhaseGenerator(target);
	const gen = bg.generate();

	util.forever(() => {
		const curr = gen.next();
		if (curr.done) {
			process.exit(0);
		}
		process.send!(curr.value);
	});
});
