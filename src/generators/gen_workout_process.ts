import WorkoutGenerator from './WorkoutGenerator';
import * as util from '../global/util';

process.on('message', (buildArg) => {
	const gen = new WorkoutGenerator(buildArg).generate();

	util.forever(() => {
		const curr = gen.next();
		if (curr.done) {
			process.exit(0);
		}
		process.send!(curr.value);
	});
});
