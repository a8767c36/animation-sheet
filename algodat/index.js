import { buffer, points } from './algodat.js';
import { next }           from './algodat.js';

postMessage({ buffer, points });

addEventListener('message', function (event) {
	var data = event.data;
	if (typeof data == 'string') data = [data];
	{ next } [data.shift()] (...data);
})

