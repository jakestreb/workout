const WorkoutGenerator = require('./WorkoutGenerator');
const util = require('../global/util');

process.on('message', (buildArg) => {
	const gen = new WorkoutGenerator(buildArg).generate();

	util.forever(() => {
		const curr = gen.next();
		if (curr.done) {
			process.exit(0);
		}
		process.send(curr.value);
	});
});
