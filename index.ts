import Workout from './src/Workout';

const generator = Workout.generator('core', 5, 30);
console.log(`${generator.next().value}`);
console.log('done');
