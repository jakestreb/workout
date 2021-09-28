import BasicGenerator from './BasicGenerator';
import * as util from '../global/util';

process.on('message', (arg) => {
	const bg = new BasicGenerator(arg);
	const gen = bg.generate();

	util.forever(() => {
		const curr = gen.next();
		if (curr.done) {
			process.exit(0);
		}
		process.send!(curr.value);
	});
});
