const fs = require('fs');

const axios = require('axios');
const ECKey = require('ec-key');
const multer = require('multer');
const QRCode = require('qrcode');
const csv = require('csv-parser');

const Transaction = require('../models/transaction');
const Block = require('../models/block');

const DIFFICULTY = 2;

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

				transactions.push(new Transaction(publicKey, randomKey.asPublicECKey().toString('spki'), row.RegionRegisteredVoters));

				node++;
			}).on('finish', () => {
				chain.push(new Block(null, transactions));
				chain[0].proofWork(DIFFICULTY);

				blockchain.initialize(chain);

				res.redirect('/');
			});
	});

	app.get('/setup/client', function (req, res, next) {
		res.render('setup/client');
	});

	app.post('/setup/client', upload.array('file', 2), function (req, res, next) {
		let {MASTER_HOST, MASTER_PORT } = process.env;


		let chain = [];
		let transactions = [];

		axios.get(`http://${MASTER_HOST}:${MASTER_PORT}/blockchain`).then((result) => {
			chain = result.data;
			//TODO Handle fail
		}).then(() => {
			let _pubKey = fs.readFileSync(req.files[0].path);
			let _privKey = fs.readFileSync(req.files[1].path);

			//TODO Check if valid
			identityManager.saveKey(_pubKey, './public.pem');
			identityManager.saveKey(_privKey, './private.pem');

			identityManager.initializeKeys();
			blockchain.initialize(chain);

			let voterCount = blockchain.getBalance(identityManager.getPublicKey());

			for(let voters = 0; voters < voterCount; voters++){
				let key = ECKey.createECKey('P-256');

				QRCode.toFile(`node_keys/${i}.png`, key.toString('pem'), function (err) {
				 		//TODO: Handle Error
				});

				transactions.push(new Transaction(identityManager.getPublicKey, key.asPublicECKey().toString('spki'),1));
			}


			let latestBlock = blockchain.lastBlock();
			let newBlock = new Block(latestBlock.hash, transactions);
			newBlock.proofWork(DIFFICULTY);
			blockchain.addBlock(newBlock);

			//TODO: Broadcast new block.....

			res.redirect('/');
		});

	});

	app.get('/setup', function (req, res, next) {
		res.render('')
	})
};



module.exports = SetupRoute;
