const Crypto = require('crypto');

class StringUtils {

	static encodeSha256(input){
		return Crypto.createHash('sha256').update(input).digest('hex');
	}


	static getProofString(difficulty){
		return String("0").repeat(difficulty);
	}

	static validateProof(target, hash, difficulty){
		return hash.substring(0, difficulty) === target;
	}

}

module.exports = StringUtils;
