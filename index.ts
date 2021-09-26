// import * as readline from 'readline';
import BasicGenerator from './src/generators/BasicGenerator';
import WorkoutTerminal from './src/terminal/WorkoutTerminal';

// readline.emitKeypressEvents(process.stdin);

const t = new WorkoutTerminal();

const wg = new BasicGenerator({
	name: 'leg_day',
	intensity: 6,
	timeMinutes: 30
});

const gen = wg.generate();

process.stdin.setRawMode!(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', async (key) => {
	if (key === '\u0003') { // ctrl-c
		t.end();
		process.exit();
	} else if (key === 'g') {
		const curr = await gen.next();
		if (curr.done) {
			process.exit(0);
		}
		t.showWorkout(curr.value);
		t.showMuscles(curr.value.activity);
	}
});

// function fixedHex(number: number, length: number){
//     var str = number.toString(16).toUpperCase();
//     while(str.length < length)
//         str = "0" + str;
//     return str;
// }

// /* Creates a unicode literal based on the string */
// function unicodeLiteral(str: string){
//     var i;
//     var result = "";
//     for( i = 0; i < str.length; ++i){
//         /* You should probably replace this by an isASCII test */
//         if(str.charCodeAt(i) > 126 || str.charCodeAt(i) < 32)
//             result += "\\u" + fixedHex(str.charCodeAt(i),4);
//         else
//             result += str[i];
//     }

//     return result;
// }

console.log('"g" to generate');
