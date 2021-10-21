import WorkoutTerminal from './src/terminal/WorkoutTerminal';
// import * as madge from 'madge';

// const config = {
// 	"detectiveOptions": {
// 		"ts": {
// 			"skipTypeImports": true
// 		}
// 	}
// };

// madge('./src/exercises', config).then((res) => {
// 	console.log(res.circular());
// });

const t = new WorkoutTerminal(
	{ name: 'back_day', intensity: 6, timeMinutes: 45 },
	['Kelci', 'Michael', 'Vini', 'Jake', 'Yudhi']
);
t.start();
