const QRCode = require('qrcode');

process.on('message', message => {
	console.log('QR Child got Message :3');

	let k = 0;

	message.keys.forEach((key) => {
		QRCode.toFile(`${message.base}/node_keys/${k}.png`, key, function (err) {
			console.log(err);
		});

		k++;
	});

	process.send('complete', (err) => {
		console.log(err);
	})
});
