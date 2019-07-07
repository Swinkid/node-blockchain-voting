const client = require('socket.io-client');
const axios = require('axios');

const Node = require('../models/node');
var Blockchain = require('../models/blockchain');

const socketListeners = require('../socketListeners');
const socketActions = require('../constants');

const { PORT, HOST, MASTER_HOST, MASTER_PORT } = process.env;

const BlockchainManager = (io, app) => {
	const blockchain = new Blockchain(null, io);

	if((MASTER_HOST && MASTER_PORT)){

		if(!nodeExists(blockchain, MASTER_HOST, MASTER_PORT)){
			const node = `http://${MASTER_HOST}:${MASTER_PORT}?p=${PORT}&h=${HOST}`;
			const socketNode = socketListeners(client(node), blockchain);

			blockchain.addNode(new Node(socketNode, MASTER_HOST, MASTER_PORT));

			axios.post(`http://${MASTER_HOST}:${MASTER_PORT}/nodes`, {
				port: PORT,
				host: HOST
			});

		}

	}

	app.post('/nodes', (req, res) => {
		const { host, port } = req.body;
		let node = `http://${host}:${port}`;

		if(!nodeExists(blockchain, host, port)) {
			let socketNode = socketListeners(client(node + `?p=${port}&h=${host}`), blockchain);

			blockchain.addNode(new Node(socketNode, host, port));

			console.info(`Added node ${node}`);
			res.json({ status: 'Added node' }).end();
		} else {
			res.json({
				status: 'Rejected Node'
			});
		}

	});

	io.on('connection', (socket) => {
		//TODO: Add/Remove as connect and disconnect
		console.info(`Blockchain Node connected, ID: ${socket.id}`);

		if(!nodeExists(blockchain, socket.handshake.query.h, socket.handshake.query.p)){
			//ADD
		}

		socket.on('disconnect', () => {
			console.log(`Blockchain Node disconnected, ID: ${socket.id}`);

			if(nodeExists(blockchain, socket.handshake.query.h, socket.handshake.query.p)){
				//REMOVE
			}

		});
	});

	blockchain.addNode(new Node(socketListeners(client(`http://${HOST}:${PORT}?p=${PORT}&h=${HOST}`)), HOST, PORT));
	nodeExists(blockchain);
};

function nodeExists(blockchain, host, port){
	let nodes = blockchain.getNodes();

	nodes.forEach(function (node) {
		if(node.host === host && node.port === port){
			return true;
		}
	});

	return false;
}

module.exports = BlockchainManager;
