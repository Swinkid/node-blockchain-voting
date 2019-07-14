const StringUtils = require('../utils/StringUtils');
const Transaction = require('./transaction');

class Block {

	constructor(previousHash, data){
		this.previousHash = previousHash;
		this.data = data;
		this.timeStamp = new Date();
		this.hash = this.calculateHash();
	}

	calculateHash(){
		return StringUtils.encodeSha256(
			this.previousHash +
			this.data +
			this.timeStamp +
			this.nonce || 0
		)
	}

}

module.exports = Block;
