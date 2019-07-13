const fs = require('fs');

const ECKey = require('ec-key');
const multer = require('multer');
const QRCode = require('qrcode');
const csv = require('csv-parser');

const upload = multer({
	dest: './tmp/'
});

const SetupRoute = (app, blockchain, identityManager) => {

	app.get('/setup/master', function(req, res, next) {
		res.render('setup/master');
	});

	app.post('/setup/master', upload.single('file'), function (req, res, next) {
		let { nodeTotal } = req.body;

		if(!identityManager.keysExist()){
			identityManager.initializeKeys();
		}


		let node = 0;
		fs.createReadStream(req.file.path)
			.pipe(csv())
			.on('data', (row) => {

				let randomKey = ECKey.createECKey('P-256');

				identityManager.saveKey(randomKey.asPublicECKey().toString('pem'), `node_keys/${row.Region}_pub.pem`);
				identityManager.saveKey(randomKey.toString('pem'), `node_keys/${row.Region}_priv.pem`);

				//TODO: Add to transaction, push to block, calc hash

				node++;
			});

		res.json({status: 'OK'});
	});

	app.get('/setup/client', function (req, res, next) {
		res.render('setup/client');
	});

	app.post('/setup/client', upload.array('file', 2), function (req, res, next) {
		let {voterCount} = req.body;

		let randomKey = ECKey.createECKey('P-256');
		QRCode.toFile('test.png', randomKey.toString('pem'), function (err) {
			console.error(err);
		});

		//TODO: Save keys locally
		//TODO: Fetch latest chain from master
		//TODO: Add 'vote' credit to each and push to blockchain

		res.json({status: 'OK'});
	});

	app.get('/setup', function (req, res, next) {
		//TODO: If keys already exist, skip?
	})
};



module.exports = SetupRoute;
