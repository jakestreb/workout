// import * as process from 'process';
import BasicGenerator from './BasicGenerator';

process.on('message', (arg) => {
	const bg = new BasicGenerator(arg);
	const gen = bg.generate();

	forever(() => {
		const curr = gen.next();
		process.send!(`${curr.value}`);
		if (curr.done) {
			process.exit(0);
		}
	});
});

function forever(callback: () => any) {
	callback();
    setTimeout(() => forever(callback), 0);
}
