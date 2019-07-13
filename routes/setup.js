const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const ECKey = require('ec-key');

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

				node++;
			});

		res.json({status: 'OK'});
	});

	app.get('/setup/client', function (req, res, next) {
		res.render('setup/client');
	});

	app.post('/setup/client', upload.array('file', 2), function (req, res, next) {
		console.log(req)


		res.json({status: 'OK'});
	});

	app.get('/setup', function (req, res, next) {
		//TODO: If keys already exist, skip?
	})
};



module.exports = SetupRoute;
