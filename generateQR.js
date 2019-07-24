const QRCode = require('qrcode');

process.on('message', message => {
	QRCode.toFile(`${message.base}/node_keys/${message.index}.png`, message.key, function (err) {});
});
