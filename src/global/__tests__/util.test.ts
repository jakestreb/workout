import * as util from '../util';

describe('util unit test', () => {
	test('stdDev', () => {
		const array1 = [1, 2, 3, 4, 5, 6, 7];
		expect(util.stdDev(array1)).toEqual(2);
	});

	test('normalScale', () => {
		const array1 = [1, 2, 3, 4, 5, 6, 7];
		expect(util.normalScale(array1, 8, 4)).toEqual([2, 4, 6, 8, 10, 12, 14]);
	});
});
