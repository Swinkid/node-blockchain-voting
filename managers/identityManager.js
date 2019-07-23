const fs = require('fs');
const ECKey = require('ec-key');

const PUBLIC_KEY = "./public.pem";
const PRIVATE_KEY = "./private.pem";

class IdentityManager {

	constructor(){
		this._publicKey = null;
		this._privateKey = null;
	}

	initializeKeys(){
		if(this.keysExist()){
			let privatePem = fs.readFileSync(PRIVATE_KEY);
			let publicPem = fs.readFileSync(PUBLIC_KEY);

			this._privateKey = new ECKey(privatePem, 'pem');
			this._publicKey = new ECKey(publicPem, 'pem');

		} else {
			let randomKey = ECKey.createECKey('P-256');

			this._publicKey = randomKey.asPublicECKey();
			this._privateKey = randomKey;

			this.saveKey(this._publicKey.toString('pem'), PUBLIC_KEY);
			this.saveKey(this._privateKey.toString('pem'), PRIVATE_KEY)
		}
	}

	/**
	 * Checks to see if the node has a key pair already saved.
	 * @returns {boolean}
	 */
	keysExist(){
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
	saveKey(key, filename){
		fs.writeFileSync(filename, key, {flag: 'wx' },function (error) {
			if(error){
				console.error(`Problem saving ${filename}`);
			}

			console.log(`Key ${filename} saved`);
		});
	}


	getPublicKey(){
		return this._publicKey.toString('spki');
	}

	getPrivateKey(){
		return this._privateKey.toString('pkcs8');
	}

}

module.exports = IdentityManager;
