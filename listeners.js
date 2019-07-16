const SocketActions = require('./constants');

const Transaction = require('./models/transaction');
const Blockchain = require('./models/blockchain');

const listeners = (socket, blockchain) => {
	socket.on(SocketActions.ADD_TRANSACTION, (sender, receiver) => {
		//TODO
	});

	socket.on(SocketActions.END_MINING, (newChain) => {
		//TODO
	});

	socket.on(SocketActions.NEW_NODE, (data) => {
		//TODO
	});

	socket.on(SocketActions.NODE_OFFLINE, (data) => {
		//TODO
	});

	socket.on(SocketActions.NODE_ONLINE, (data) => {
		//TODO
	});

	return socket;
};

module.exports = listeners;
