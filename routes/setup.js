const fs = require('fs');

const axios = require('axios');
const ECKey = require('ec-key');
const multer = require('multer');
const QRCode = require('qrcode');
const csv = require('csv-parser');

const Transaction = require('../models/transaction');
const Block = require('../models/block');
const Constants = require('../constants');

const upload = multer({
	dest: './tmp/'
});

const SetupRoute = (app, blockchain, identityManager, io) => {

	app.get('/setup/master', function(req, res, next) {
		res.render('setup/master');
	});

	app.post('/setup/master', upload.single('file'), function (req, res, next) {
		const {candidateCount} = req.body;

		identityManager.initializeKeys();
		let publicKey = identityManager.getPublicKey();

		let node = 0;
		let chain = [];
		let transactions = [];

		generateCandidateKeys(candidateCount);

		fs.createReadStream(req.file.path)
			.pipe(csv())
			.on('data', (row) => {

				let randomKey = ECKey.createECKey('P-256');

				identityManager.saveKey(randomKey.asPublicECKey().toString('pem'), `node_keys/${row.Region}_pub.pem`);
				identityManager.saveKey(randomKey.toString('pem'), `node_keys/${row.Region}_priv.pem`);

				transactions.push(new Transaction(publicKey, randomKey.asPublicECKey().toString('spki'), row.RegionRegisteredVoters, identityManager.getPrivateKey()));

				node++;
			}).on('finish', () => {
				chain.push(new Block(null, transactions));
				chain[0].proofWork(process.env.DIFFICULTY);

				blockchain.initialize(chain);

				res.redirect('/');
			});
	});

	app.get('/setup/client', function (req, res, next) {
		res.render('setup/client');
	});

	app.post('/setup/client', upload.array('file', 2), function (req, res, next) {
		let {MASTER_HOST, MASTER_PORT } = process.env;
		const {candidateCount} = req.body;

		let chain = [];

		axios.get(`http://${MASTER_HOST}:${MASTER_PORT}/blockchain`).then((result) => {
			chain = result.data;
		}).then(() => {
			const pubKey = fs.readFileSync(req.files[0].path);
			const privKey = fs.readFileSync(req.files[1].path);

			//TODO Check if valid

			identityManager.saveKey(pubKey, './public.pem');
			identityManager.saveKey(privKey, './private.pem');

			identityManager.initializeClientKeys();

			console.log(`pk: ${identityManager.getPublicKey(privKey)}`);

			blockchain.initialize(chain);

			let voterCount = blockchain.getBalance(identityManager.getPublicKey());

			for(let voters = 0; voters < voterCount; voters++){
				let key = ECKey.createECKey('P-256');

				QRCode.toFile(`node_keys/${voters}.png`, key.toString('pem'), function (err) {
				 		console.log(err);
				});

				io.emit(Constants.NEW_TRANSACTION, identityManager.getPublicKey(), key.asPublicECKey().toString('spki'), 1, identityManager.getPrivateKey());
			}

			generateCandidateKeys(candidateCount);

			res.redirect('/');
		}).catch(function (error) {
			console.log(error);
			process.exit();
		});

	});

	app.get('/setup', function (req, res, next) {
		res.render('')
	})
};

function generateCandidateKeys(candidateCount){
	for(let candidates = 0; candidates < candidateCount; candidates++){
		let key = ECKey.createECKey('P-256');

		QRCode.toFile(`node_keys/candidate-${candidates}.png`, key.asPublicECKey().toString('pem'), function (err) {
			//TODO: Handle Error
		});
	}
}


module.exports = SetupRoute;
