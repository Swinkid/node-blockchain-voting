const fs = require('fs');

const axios = require('axios');
const ECKey = require('ec-key');
const multer = require('multer');


//const QRCode = require('qrcode');
const qr = require('qr-image');


const csv = require('csv-parser');
const workerpool = require('workerpool');

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
				identityManager.saveKey(randomKey.toString('pem'), `/node_keys/${row.Region}_priv.pem`);

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
		}).then( () => {
			const pubKey = fs.readFileSync(req.files[0].path);
			const privKey = fs.readFileSync(req.files[1].path);

			//TODO Check if valid

			identityManager.saveKey(pubKey, './public.pem');
			identityManager.saveKey(privKey, './private.pem');

			identityManager.initializeClientKeys(privKey);

			console.log(`pk: ${identityManager.getPublicKey()}`);

			blockchain.initialize(chain);

			let newKeys = [];

			blockchain.getBalance(identityManager.getPublicKey()).then((amount) => {
				setupTransaction(amount, io, identityManager).then((keys) => {
					newKeys = keys;
					res.redirect('/');
				});
			}).then(() => {
				//TODO: Write Keys
				//TODO find a way to write QR to file without fooking the IO
				writeQR(newKeys);
			});

			generateCandidateKeys(candidateCount).then(complete => {});




			//let voterCount = blockchain.getVoterCount(identityManager.getPublicKey());


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
	return new Promise(resolve => {
		for(let candidates = 0; candidates < candidateCount; candidates++){
			let key = ECKey.createECKey('P-256');

			// QRCode.toFile(`node_keys/candidate-${candidates}.png`, key.asPublicECKey().toString('pem'), function (err) {
			// 	//TODO: Handle Error
			// });
		}

		resolve();
	});
}

function setupTransaction(amount, io, identityManager){
	return new Promise(resolve => {
		setImmediate(() => {
			let keys = [];

			for (let voters = 0; voters < amount; voters++) {
				let key = ECKey.createECKey('P-256');

				//writeQR(voters, key);
				keys.push(key);
				sendEmit(io, identityManager, key);

			}

			resolve(keys);
		});
	});
}

function writeQR(keys){
	new Promise(resolve => {

		let k = 0;

		keys.forEach((key) => {

			// QRCode.toFileStream(`${__basedir}/node_keys/${k}.png`, key.toString('pem'), function (err) {}).then((stream) => {
			//
			// 	stream.
			//
			// });

			// let qr = qr.image(key.toString('pem'), {
			// 	type: 'png'
			// });
			//
			// qr.pipe(fs.createWriteStream(`${__basedir}/node_keys/${k}.png`));

			let qr = qr.image(key.toString('pem'), { type: 'png' }).pipe(fs.createWriteStream(`${__basedir}/node_keys/${k}.png`));


			k++;
		});

		resolve();
	})
}

function sendEmit(io, identityManager, key){
	return new Promise(resolve => {
		io.emit(Constants.NEW_TRANSACTION, identityManager.getPublicKey(), key.asPublicECKey().toString('spki'), 1, identityManager.getPrivateKey());
	})
}

module.exports = SetupRoute;
