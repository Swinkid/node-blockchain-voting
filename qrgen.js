const QRCode = require('qrcode');

process.on('message', message => {
	console.log('QR Child got Message :3');
	QRCode.toFile(`${message.base}/node_keys/${message.index}.png`, message.key, function (err) {});
});
