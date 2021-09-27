import BasicGenerator from './src/generators/BasicGenerator';
import WorkoutTerminal from './src/terminal/WorkoutTerminal';

const t = new WorkoutTerminal(['Kelci', 'Michael', 'Vini', 'Jake', 'Yudhi']);

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
		const curr = await gen.next(t.locked);
		if (curr.done) {
			process.exit(0);
		}
		t.update(curr.value);
	}
});

console.log('"g" to generate');

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
