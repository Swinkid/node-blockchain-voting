const fs = require('fs');

const axios = require('axios');
const ECKey = require('ec-key');
const multer = require('multer');


const QRCode = require('qrcode');

//const qr = require('qr-image');


const csv = require('csv-parser');

const Transaction = require('../models/transaction');
const Block = require('../models/block');
const Constants = require('../constants');

const upload = multer({
	dest: './tmp/'
});

/**
 *
 * @param app
 * @param blockchain
 * @param identityManager
 * @param io
 * @constructor
 */
const SetupRoute = (app, blockchain, identityManager, io) => {

	app.get('/setup/master', function(req, res, next) {
		return res.render('setup/master');
	});

	app.post('/setup/master', upload.single('file'), (req, res, next) => {
		const {candidateCount} = req.body;

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
				identityManager.saveKey(randomKey.toString('pem'), `/node_keys/${row.Region}_priv.pem`);

				transactions.push(new Transaction(publicKey, randomKey.asPublicECKey().toString('spki'), row.RegionRegisteredVoters, identityManager.getPrivateKey()));

				node++;
			}).on('finish', () => {
				chain.push(new Block(null, transactions));
				chain[0].proofWork(process.env.DIFFICULTY);

				blockchain.initialize(chain);

				return res.redirect('/');
			});
	});

	/**
	 * Setup client route
	 */
	app.get('/setup/client', (req, res, next) => {
		return res.render('setup/client');
	});

	/**
	 * Setup client route
	 */
	app.post('/setup/client', upload.array('file', 2), (req, res, next) => {
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
				setupTransaction(amount, io, identityManager, candidateCount).then((keys) => {

				});
			});

			return res.redirect('/');

		}).catch(function (error) {
			console.log(error);
			process.exit();
		});
	});

	/**
	 * Generate QR Codes
	 */
	app.get('/setup/client/qr', function (req, res, next) {

		const { fork } = require('child_process');
		const n = fork(`${__basedir}/qrgen.js`);

		n.send({
			message: 'ping'
		});

		return res.json({ message: 'Ok'})

	});

	/**
	 * Setup route
	 */
	app.get('/setup', function (req, res, next) {
		res.render('')
	})
};

/**
 * Setup Transaction
 * @param amount
 * @param io
 * @param identityManager
 * @returns {Promise<unknown>}
 */
function setupTransaction(amount, io, identityManager, candidateAmount){
	return new Promise(resolve => {
		setImmediate(() => {
			let keys = [];
			let candidateKeys = [];

			for (let voters = 0; voters < amount; voters++) {
				let key = ECKey.createECKey('P-256');

				identityManager.saveKey(key, `node_keys/voterkeys/${voters}.pem`);
				sendEmit(io, identityManager, key);
			}

			for(let candidates = 0; candidates < parseInt(candidateAmount); candidates++){
				let key = ECKey.createECKey('P-256');
				identityManager.saveKey(key, `node_keys/candidatekeys/c-${candidates}.pem`);
			}

			resolve();
		});
	});
}

/**
 * Broadcast Transaction to Nodes
 * @param io
 * @param identityManager
 * @param key
 * @returns {Promise<unknown>}
 */
function sendEmit(io, identityManager, key){
	return new Promise(resolve => {
		let transaction = new Transaction( identityManager.getPublicKey(), key.asPublicECKey().toString('spki'), 1, identityManager.getPrivateKey());
		io.emit(Constants.NEW_TRANSACTION, transaction);
	})
}

module.exports = SetupRoute;
