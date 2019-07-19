const SocketActions = require('./constants');

const Transaction = require('./models/transaction');
const Blockchain = require('./models/blockchain');

const listeners = (socket, blockchain) => {
	socket.on(SocketActions.ADD_TRANSACTION, (sender, receiver, amount, privateKey) => {
		const transaction = new Transaction(sender, receiver, amount, privateKey);
		blockchain.newTransaction(transaction);
		console.log(`Transaction recieved.`)
	});

	socket.on(SocketActions.END_MINING, (newChain) => {
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
