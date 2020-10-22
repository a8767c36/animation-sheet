
const nDim = 2;
const xLen = 32;
const yLen = 32;

/* lang = C
struct Point {
	f32       a,
	f32[nDim] b,
};

struct Point_IstNew {
	Point ist,
	Point new,
}

Point_IstNew[yLen * xLen] points;
*/

const buffer = new SharedArrayBuffer(Float32Array.BYTES_PER_ELEMENT * (yLen * xLen) * 2 * (1 + nDim));
const points = new Float32Array(buffer);



/* creates a view on a point */
function  point (x, y, IstNew = false) {
	if (x <     0) return new Float32Array([point(           1, y, IstNew)[0], 0, 0]);
	if (x >= xLen) return new Float32Array([point(xLen - 1 - 1, y, IstNew)[0], 0, 0]);
	if (y <     0) return new Float32Array([point(x,            1, IstNew)[0], 0, 0]);
	if (y >= yLen) return new Float32Array([point(x, yLen - 1 - 1, IstNew)[0], 0, 0]);
	return new Float32Array(buffer, Float32Array.BYTES_PER_ELEMENT * ((xLen * y + x) * 2 * (1 + nDim) + IstNew * (1 + nDim)), (1 + nDim));
}


function next () {
	for (var y = 0; y < yLen; y++) {
		for (var x = 0; x < xLen; x++) {
			const ist = point(x, y, 0);
			const neu = point(x, y, 1);

			neu[0    ] = ist[0    ];
			neu[1 + 0] = ist[1 + 0];
			neu[1 + 1] = ist[1 + 1];

			const p = ist;
			const d = 1/32;
			neu[0    ] = neu[0    ] + d*point(x - 1, y)[1 + 0] - d*point(x + 1, y)[1 + 0];
			neu[0    ] = neu[0    ] + d*point(x, y - 1)[1 + 1] - d*point(x, y + 1)[1 + 1];
			neu[1 + 0] = neu[1 + 0] - d*(p[0] - point(x - 1, y)[0]) - d*(point(x + 1, y)[0] - p[0]);
			neu[1 + 1] = neu[1 + 1] - d*(p[0] - point(x, y - 1)[0]) - d*(point(x, y + 1)[0] - p[0]);

			for (var n in neighbourhood) { }
		}
	}

	for (var y = 0; y < yLen; y++) {
		for (var x = 0; x < xLen; x++) {
			const ist = point(x, y, 0);
			const neu = point(x, y, 1);
			
			ist[0    ] = neu[0    ];
			ist[1 + 0] = neu[1 + 0];
			ist[1 + 1] = neu[1 + 1];
		}
	}
}



function normalize () {
	let sum = 0;
	for (var y = 0; y < yLen; y++) {
		for (var x = 0; x < xLen; x++) {
			var p = point(x, y);
			sum += p[0] ** 2 + p[1] ** 2 + p[2] ** 2;
		}
	}

	var norm = Math.sqrt(sum);
	norm = norm / Math.sqrt(xLen * yLen);
	var inv = 1/norm;
	for (var y = 0; y < yLen; y++) {
		for (var x = 0; x < xLen; x++) {
			var p = point(x, y);
			p[0] = p[0] * inv;
			p[1] = p[1] * inv;
			p[2] = p[2] * inv;
		}
	}
}



function filter () {
	for (var y = 0; y < yLen; y++) {
		for (var x = 0; x < xLen; x++) {
			const neu = point(x, y, 1);

			neu[0] = 31/32 * point(x, y)[0] + 1/128 * point(x - 1, y)[0]
			                                + 1/128 * point(x + 1, y)[0]
			                                + 1/128 * point(x, y - 1)[0]
			                                + 1/128 * point(x, y + 1)[0];
		}
	}

	for (var y = 0; y < yLen; y++) {
		for (var x = 0; x < xLen; x++) {
			const ist = point(x, y, 0);
			const neu = point(x, y, 1);
			
			ist[0    ] = neu[0    ];
		}
	}
}


function filterAggressive () {
	for (var y = 0; y < yLen; y++) {
		for (var x = 0; x < xLen; x++) {
			const neu = point(x, y, 1);

			neu[0] = 3/4 * point(x, y)[0] + 1/16 * point(x - 1, y)[0]
			                              + 1/16 * point(x + 1, y)[0]
			                              + 1/16 * point(x, y - 1)[0]
			                              + 1/16 * point(x, y + 1)[0];
		}
	}

	for (var y = 0; y < yLen; y++) {
		for (var x = 0; x < xLen; x++) {
			const ist = point(x, y, 0);
			const neu = point(x, y, 1);
			
			ist[0    ] = neu[0    ];
		}
	}
}



export { buffer, points };
export { xLen, yLen, nDim };
export { next, point, normalize, filter, filterAggressive };





const neighbourhood = [
	{ x:  0, y:  0, r: 1.000},
];
