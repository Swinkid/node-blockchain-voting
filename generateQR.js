const QRCode = require('qrcode');
const ECKey = require('ec-key');




process.on('message', message => {
	QRCode.toFileStream(`${message.base}/node_keys/${message.index}.png`, message.key, function (err) {});
});
