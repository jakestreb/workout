import WorkoutGenerator from './WorkoutGenerator';
import * as util from '../global/util';

process.on('message', async (buildArgs: [any, number]) => {
	const wg = new WorkoutGenerator(...buildArgs);
	const gen = wg.generate();

	util.forever(async () => {
		const curr = await gen.next();
		if (curr.done) {
			process.exit(0);
		}
		process.send!(curr.value);
	});
});
