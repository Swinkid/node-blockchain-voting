const client = require('socket.io-client');
const axios = require('axios');

const Node = require('../models/node');
const Blockchain = require('../models/blockchain');
const IdentityManger = require('../managers/identityManager');

const socketListeners = require('../listeners');
const Constants = require('../constants');

const { PORT, HOST, MASTER_HOST, MASTER_PORT } = process.env;

const BlockchainManager = (io, app) => {

	//Setup Blockchain (Don't Initialize yet..)
	const blockchain = new Blockchain(io);

	app.test = "meow";

	const identityManager = new IdentityManger();
	const setupRoute = require('../routes/setup')(app, blockchain, identityManager, io);

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
			}).then((result) => {

				axios.get(`http://${MASTER_HOST}:${MASTER_PORT}/nodes`).then((result) => {

					var existingNodes = result.data;

					for(var i = 0; i < existingNodes.length; i++){
						let n = existingNodes[i].host;
						let p = existingNodes[i].port;

						let node = `http://${n}:${p}`;

						if(!nodeExists(blockchain, n, p)) {
							blockchain.addNode(new Node(socketListeners(client(node + `?cbaddr=${n}:${p}`, {
								'reconnection' : false
							}), blockchain), n, p));

							axios.post(`http://${n}:${p}/nodes`, {
								port: PORT,
								host: HOST
							}).catch(() => {});

							console.info(`Added node ${node}`);
						}
					}

				}).catch((error) => {
					console.log(error);
				});

			}).catch(function (error) {
				process.exit();
			});
		}

	}

	app.get('/', function(req, res, next) {
		if(blockchain.isInitialized()){
			res.redirect('/stats')
		} else {
			res.redirect('/setup')
		}
	});

	app.post('/transaction', function(req, res, next) {
		const {sender, reciever, privateKey} = req.body;

		io.emit(Constants.ADD_TRANSACTION, sender, reciever, 1, privateKey);
		res.json({status: 'Ok'}).end();
	});

	app.get('/stats', function (req, res, next) {
		//TODO FIX CHAIN VALIDATION
		res.render('stats', { blockchain: blockchain, nodes: blockchain.getNodes()});
	});

	app.get('/nodes', (req, res) => {
		var nodes = [];

		for(var i = 0; i < blockchain.getNodes().length; i++){
			let n = {};
			n.host = blockchain.getNodes()[i].host;
			n.port = blockchain.getNodes()[i].port;

			nodes.push(n);
		}

		return res.json(nodes);
	});

	app.get('/blockchain/initialize', (req, res) => {
		console.log(blockchain.isInitialized());
	});

	app.get('/blockchain', (req, res) => {
		return res.json(blockchain.getChain());
	});

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
			}).end();
		} else {
			res.json({
				status: 'Rejected Node'
			}).end();
		}

	});

	io.on('connection', (socket) => {
		console.info(`Blockchain Node connected, ID: ${socket.id}`);

		socket.on('disconnect', () => {
			console.log(`Blockchain Node disconnected, ID: ${socket.id}`);

			var host = String(socket.handshake.query.cbaddr).split(":")[0];
			var port = String(socket.handshake.query.cbaddr).split(":")[1];

			if(nodeExists(blockchain, host, port)){
				blockchain.removeNode(host, port);
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
