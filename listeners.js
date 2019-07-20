const Constants = require('./constants');

const Transaction = require('./models/transaction');
const Blockchain = require('./models/blockchain');

const listeners = (socket, blockchain) => {
	socket.on(Constants.NEW_TRANSACTION, (sender, receiver, amount, privateKey) => {
		const transaction = new Transaction(sender, receiver, amount, privateKey);
		blockchain.newTransaction(transaction);
		console.log(`Transaction recieved.`)
	});

	socket.on(Constants.STOP_WORK, (newChain) => {
		process.env.BREAK = 'true';

		const newBlockchain = new Blockchain();
		newBlockchain.parseChain(newChain);

		if(newBlockchain.validateChain(process.env.DIFFICULTY) && newBlockchain.getChainLength() >= blockchain.getChainLength()){
			blockchain.setChain(newChain);
		}

	});

	return socket;
};

module.exports = listeners;
