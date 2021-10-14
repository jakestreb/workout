import WorkoutGenerator from './src/generators/WorkoutGenerator';
import WorkoutTerminal from './src/terminal/WorkoutTerminal';

const wg = new WorkoutGenerator({
	name: 'back_day',
	intensity: 6,
	timeMinutes: 30
});

const t = new WorkoutTerminal(wg, ['Kelci', 'Michael', 'Vini', 'Jake', 'Yudhi']);

