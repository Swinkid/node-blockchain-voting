const ECKey = require('ec-key');
const fs = require('fs');

/**
 *
 * @param app
 * @param blockchain
 * @constructor
 */
const IdentityManager = (app, blockchain) => {

	console.log(blockchain.isInitialized());
	blockchain.initialize(null);
	console.log(blockchain.isInitialized());

	let randomKey = ECKey.createECKey('P-256');
	console.log(randomKey.asPublicECKey().toString('pem'))

	console.log(app.test)

};

/**
 * Checks to see if the node has a key pair already saved.
 * @returns {boolean}
 */
function keysExist(){
	return false;
}

module.exports = IdentityManager;
