import * as algodat from './algodat/algodat.js';

const canvas = document.querySelector('#canvas');
const gl     = canvas.getContext('webgl');

const vsSource = `
attribute vec2 aPos;

varying   vec2 vPos;

void main () {
	gl_Position = vec4(aPos, 0.0, 1.0);
	vPos = aPos;
}
`;
const fsSource = `
precision mediump float;
varying   vec2 vPos;

uniform sampler2D uTex;

void main () {
	gl_FragColor = texture2D(uTex, (vPos + 1.0) / 2.0);
	// if (vPos.y >  1.0 * gl_FragColor.r) discard;
	// if (vPos.y < -1.0 * gl_FragColor.b) discard;
}
`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vsSource);
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(vertexShader));
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fsSource);
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(fragmentShader));
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
gl.useProgram(shaderProgram);

const aPos = gl.getAttribLocation(shaderProgram, 'aPos');
const uTex = gl.getUniformLocation(shaderProgram, 'uTex');

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, +1, +1, -1, +1, +1]), gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPos);

const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.uniform1i(uTex, 0);

export
function draw () {
	const { xLen, yLen } = algodat, nDim = 2;
	const data = new Float32Array(Float32Array.BYTES_PER_ELEMENT * yLen * xLen);
	for (let y = 0; y < yLen; y++) {
		for (let x = 0; x < xLen; x++) {
			data[xLen * y + x] = algodat.point(x, y)[0];
		}
	}

	const imageData = new ImageData(xLen, yLen);
	const imageDataData = imageData.data;
	const { exp } = Math;
	for (let i = 0; i < yLen * xLen; i++) {
		let d = activate(data[i]);
		function activate (x) {
			return 1 - exp(-x);
		}
		imageDataData[4 * i + 0] = d * +256;
		imageDataData[4 * i + 2] = d * -256;
		imageDataData[4 * i + 3] = 255;
	}

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, xLen, yLen, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageDataData);

	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

