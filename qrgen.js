const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const ECKey = require('ec-key');

const EXTENSION = '.pem';
const VOTER_PATH = `${__dirname}/node_keys/voterkeys`;
const CANDIDATE_PATH = `${__dirname}/node_keys/candidatekeys`;

process.on('message', message => {

	fs.readdir(VOTER_PATH, function (error, files) {
		if(error){
			console.log('error');
		}

		files.filter(function (file) {
			return path.extname(file).toLowerCase() === EXTENSION;
		});

		let keyIndex = 0;
		files.forEach((item) => {
			fs.readFile(`${VOTER_PATH}/${item}`, function (error, fileContents) {
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

	});

	fs.readdir(CANDIDATE_PATH, (error, files) => {
		if(error){
			console.log(error);
		}

		files.filter((file) =>{
			return path.extname(file).toLowerCase() === EXTENSION;
		});

		let keyIndex = 0;
		files.forEach((item) => {
			fs.readFile(`${CANDIDATE_PATH}/${item}`, function (error, fileContents) {
				if(error) {
					console.log(error);
				}

				let key = new ECKey(fileContents, 'pem');

				QRCode.toFile(`${__dirname}/node_keys/candidatekeys/c-${keyIndex}.png`, key.toString('spki'), function (err) {

				});

				fs.unlink(`${__dirname}/node_keys/candidatekeys/c-${keyIndex}.pem`, function (error) {

				});

				keyIndex++;

			});
		});

	});

});
