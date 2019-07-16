const fs = require('fs');

const axios = require('axios');
const ECKey = require('ec-key');
const multer = require('multer');
const QRCode = require('qrcode');
const csv = require('csv-parser');

const Transaction = require('../models/transaction');
const Block = require('../models/block');

const upload = multer({
	dest: './tmp/'
});

const SetupRoute = (app, blockchain, identityManager) => {

	app.get('/setup/master', function(req, res, next) {
		res.render('setup/master');
	});

	app.post('/setup/master', upload.single('file'), function (req, res, next) {
		identityManager.initializeKeys();
		let publicKey = identityManager.getPublicKey();

		let node = 0;
		let chain = [];
		let transactions = [];

		fs.createReadStream(req.file.path)
			.pipe(csv())
			.on('data', (row) => {

				let randomKey = ECKey.createECKey('P-256');

				identityManager.saveKey(randomKey.asPublicECKey().toString('pem'), `node_keys/${row.Region}_pub.pem`);
				identityManager.saveKey(randomKey.toString('pem'), `node_keys/${row.Region}_priv.pem`);

				//TODO: Add to transaction, push to block, calc hash

				transactions.push(new Transaction(publicKey, randomKey.asPublicECKey().toString('spki'), row.RegionRegisteredVoters));

				node++;
			}).on('finish', () => {
				chain.push(new Block(null, transactions));
				chain[0].proofWork(6);
				blockchain.initialize(chain);
				res.json({status: 'OK'});
			});




	});

	app.get('/setup/client', function (req, res, next) {
		res.render('setup/client');
	});

	app.post('/setup/client', upload.array('file', 2), function (req, res, next) {
		let {MASTER_HOST, MASTER_PORT } = process.env;
		let {voterCount} = req.body;


		let chain = [];
		let transactions = [];

		//TODO: Fetch latest chain from master
		axios.get(`http://${MASTER_HOST}:${MASTER_PORT}/blockchain`). then((result) => {
			chain = result.data;
		});

		for(let i  = 0; i < voterCount; i++){
			let key = ECKey.createECKey('P-256');

			QRCode.toFile(`node_keys/${i}.png`, key.toString('pem'), function (err) {
				//TODO: Handle Error
			});

			//TODO: Add to Blockchain
		}

		//TODO: Add transactions to block, add block to chain, push.
		blockchain.initialize(chain);

		res.json({status: 'OK'});
	});

	app.get('/setup', function (req, res, next) {
		//TODO: If keys already exist, skip?
	})
};



module.exports = SetupRoute;
