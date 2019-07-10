const client = require('socket.io-client');
const axios = require('axios');
const _ = require('lodash');

const Node = require('../models/node');
var Blockchain = require('../models/blockchain');

const socketListeners = require('../socketListeners');
const socketActions = require('../constants');

const { PORT, HOST, MASTER_HOST, MASTER_PORT } = process.env;

const BlockchainManager = (io, app) => {
	const blockchain = new Blockchain(null, io);

	if((MASTER_HOST && MASTER_PORT)){

		if(!nodeExists(blockchain, MASTER_HOST, MASTER_PORT)){
			const node = `http://${MASTER_HOST}:${MASTER_PORT}?cbaddr=${HOST}:${PORT}`;
			const socketNode = socketListeners(client(node, {
				'reconnection' : false
			}), blockchain);

			blockchain.addNode(new Node(socketNode, MASTER_HOST, MASTER_PORT));

			axios.post(`http://${MASTER_HOST}:${MASTER_PORT}/nodes`, {
				port: PORT,
				host: HOST
			}).catch(function (error) {
				process.exit();
			});

		}

	}

	app.post('/nodes', (req, res) => {
		const { host, port } = req.body;
		let node = `http://${host}:${port}`;

		if(!nodeExists(blockchain, host, port)) {
			blockchain.addNode(new Node(socketListeners(client(node + `?cbaddr=${HOST}:${PORT}`, {
				'reconnection' : false
			}), blockchain), host, port));

			console.info(`Added node ${node}`);

			res.json({
				status: 'Added node'
			});
		} else {
			res.status(500).json({
				status: 'Rejected Node'
			});
		}

	});

	io.on('connection', (socket) => {
		//TODO: Add/Remove as connect and disconnect
		console.info(`Blockchain Node connected, ID: ${socket.id}`);
		console.info(`Blockchain Node Info: ${socket.handshake.query.cbaddr}`);

		socket.on('disconnect', () => {
			console.log(`Blockchain Node disconnected, ID: ${socket.id}`);

			var host = String(socket.handshake.query.cbaddr).split(":")[0];
			var port = String(socket.handshake.query.cbaddr).split(":")[1];

			if(nodeExists(blockchain, host, port)){
				console.info(`disconnecting ${socket.id}`);
				blockchain.removeNode(host, port);
				console.log(`Removed ${socket.id}`);
			}

		});
	});

	blockchain.addNode(new Node(socketListeners(client(`http://${HOST}:${PORT}?cbaddr=${HOST}:${PORT}`, {
		'reconnection' : false
	}), blockchain), HOST, PORT));
};

function nodeExists(blockchain, host, port){
	let nodes = blockchain.getNodes();

	for(let i = 0; i < nodes.length; i++){
		if(nodes[i].host === host && nodes[i].port === port){
			return true;
		}
	}
}

module.exports = BlockchainManager;
