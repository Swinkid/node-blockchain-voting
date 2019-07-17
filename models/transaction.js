const ECKey = require('ec-key');
const StringUtil = require('../utils/StringUtils');

class Transaction {

	constructor(sender, receiver, amount) {
		this.sender = sender;
		this.receiver = receiver;
		this.amount = amount;
		this.timestamp = Date.now();
		this.transactionId = this.calculateHash();
	}

	signTransactions(privateKey){
		let key = new ECKey(privateKey, 'pkcs8');

	}

	verifyTransaction(publicKey){
		let key = new ECKey(publicKey, 'spki');
	}

	calculateHash(){
		return StringUtil.encodeSha256(
			this.sender +
			this.receiver +
			this.amount
		);
	}

	//TODO: Sign transactions
}

module.exports = Transaction;
