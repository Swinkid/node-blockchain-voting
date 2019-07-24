const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const ECKey = require('ec-key');

const PEM_EXTENSION = '.pem';
const PNG_EXTENSION = '.png';

const PATH = `${__dirname}/node_keys`;
const VOTER_PATH = `${PATH}/voterkeys`;

process.on('message', message => {

	fs.readdir(VOTER_PATH, function (directoryReadError, files) {
		if(directoryReadError){
			console.log(directoryReadError);
		}

		files.filter(function (file) {
			return path.extname(file).toLowerCase() === PEM_EXTENSION;
		});

		let keyIndex = 0;
		files.forEach((item) => {
			fs.readFile(`${VOTER_PATH}/${item}`, function (readError, fileContents) {
				if(readError) {
					console.log(readError);
				}

				let key = new ECKey(fileContents, 'pem');

				QRCode.toFile(`${PATH}/${keyIndex}${PNG_EXTENSION}`, key.toString('pkcs8'), function (qrError) {
					if(qrError){
						console.log(qrError);
					}
				});

				fs.unlink(`${VOTER_PATH}/${keyIndex}${PEM_EXTENSION}`, function (deleteError, deleteData) {
					if(deleteError){
						console.log(deleteError);
					}
				});

				keyIndex++;
			});
		});

		process.send('complete');
	});
});
