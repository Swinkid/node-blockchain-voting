const ECKey = require('ec-key');
const fs = require('fs');

const PUBLIC_KEY = "./public.pem";
const PRIVATE_KEY = "./private.pem";

let privateKey = null;
let publicKey = null;

/**
 *
 * @param app
 * @param blockchain
 * @constructor
 */
const IdentityManager = (app, blockchain) => {

	//TODO
//	console.log(blockchain.isInitialized());
//	blockchain.initialize(null);
//	console.log(blockchain.isInitialized());

	initializeKeys();


};

/**
 *
 */
function initializeKeys(){
	if(keysExist()){
		let privatePem = fs.readFileSync(PRIVATE_KEY);
		let publicPem = fs.readFileSync(PUBLIC_KEY);

		privateKey = new ECKey(privatePem, 'pem');
		publicKey = new ECKey(publicPem, 'pem');

		console.log(privateKey.toString('pem'));
		console.log(publicKey.toString('pem'));

	} else {
		let randomKey = ECKey.createECKey('P-256');

		publicKey = randomKey.asPublicECKey();
		privateKey = randomKey;

		saveKey(publicKey.toString('pem'), PUBLIC_KEY);
		saveKey(privateKey.toString('pem'), PRIVATE_KEY)
	}
}

/**
 * Checks to see if the node has a key pair already saved.
 * @returns {boolean}
 */
function keysExist(){
	try {
		return fs.existsSync(PRIVATE_KEY) && fs.existsSync(PUBLIC_KEY);
	} catch (e) {
		return false;
	}
}

/**
 *
 * @param key
 * @param filename
 */
function saveKey(key, filename){
	fs.writeFileSync(filename, key, function (error) {
		if(error){
			console.error(`Problem saving ${filename}`);
		}

		console.log(`Key ${filename} saved`);
	});
}

module.exports = IdentityManager;
