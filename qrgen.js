const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const ECKey = require('ec-key');

const EXTENSION = '.pem';
const PATH = `${__dirname}/node_keys/voterkeys`;

process.on('message', message => {

	fs.readdir(PATH, function (error, files) {
		if(error){
			console.log('error');
		}

		files.filter(function (file) {
			return path.extname(file).toLowerCase() === EXTENSION;
		});

		let keyIndex = 0;
		files.forEach((item) => {
			fs.readFile(`${PATH}/${item}`, function (error, fileContents) {
				if(error) {
					console.log(error);
				}

				let key = new ECKey(fileContents, 'pem');

				QRCode.toFile(`${__dirname}/node_keys/${keyIndex}.png`, key.toString('pkcs8'), function (err) {

				});

				fs.unlink(`${__dirname}/node_keys/voterkeys/${keyIndex}.pem`, function (error) {
					
				});

				keyIndex++;

			});
		});


		//TODO Delete pem
	});



	// message.keys.forEach((key) => {
	// 	QRCode.toFile(`${message.base}/node_keys/${message.index}.png`, key, function (err) {
	// 		console.log(err);
	// 	});
	//
	// 	k++;
	// });

});
