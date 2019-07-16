class Transaction {
	constructor(sender, receiver, amount) {
		this.sender = sender;
		this.receiver = receiver;
		this.amount = amount;
		this.timestamp = Date.now();
	}

	//TODO: Sign transactions
}

module.exports = Transaction;
