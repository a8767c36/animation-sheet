
const worker = new Worker('./algodat/index.js', { type: 'module' });
const {
		buffer,
		points,
	} = await new Promise(fulfill => worker
		.addEventListener('message', console.log, { once: true })
	);

