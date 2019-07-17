const ECKey = require('ec-key');
const StringUtil = require('../utils/StringUtils');

class Transaction {

	constructor(sender, receiver, amount, senderPrivateKey) {
		this.sender = sender;
		this.receiver = receiver;
		this.amount = amount;
		this.timestamp = Date.now();
		this.transactionId = this.calculateHash();
		this.signature = this.signTransactions(senderPrivateKey);
	}

	signTransactions(privateKey){
		let key = new ECKey(privateKey, 'pkcs8');
		let signData = `${this.sender}${this.receiver}${this.amount}`;

		return key.createSign('SHA256').update(signData).sign('base64');
	}

	verifyTransaction(){
		let key = new ECKey(this.sender, 'spki');
		let signData = `${this.sender}${this.receiver}${this.amount}`;

		return key.createVerify('SHA256').update(signData).verify(this.signature, 'base64');
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
