const client = require('socket.io-client');
const axios = require('axios');

const Node = require('../models/node');
const Blockchain = require('../models/blockchain');
const IdentityManger = require('../managers/identityManager');

const socketListeners = require('../listeners');
const Constants = require('../constants');

const { PORT, HOST, MASTER_HOST, MASTER_PORT } = process.env;

/**
 * BlochchainManager. Handles functions relating to the blockchain.
 * @param io
 * @param app
 * @constructor
 */
const BlockchainManager = (io, app) => {

	//Setup Blockchain (Don't Initialize yet..)
	const blockchain = new Blockchain(io);

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

	/**
	 * Go to stats if blockchain initialized
	 */
	app.get('/', (req, res, next) => {
		if(blockchain.isInitialized()){
			return res.redirect('/stats');
		} else {
			return res.redirect('/setup');
		}
	});

	/**
	 * Handles adding transaction to pool
	 */
	app.post('/transaction', (req, res, next) => {
		const {sender, reciever, privateKey} = req.body;

		const transaction = new Transaction(sender, reciever, 1, privateKey);
		io.emit(Constants.NEW_TRANSACTION, transaction);

		//io.emit(Constants.NEW_TRANSACTION, sender, reciever, 1, privateKey);
		return res.json({status: 'Ok'});
	});

	/**
	 * Handle stats page
	 */
	app.get('/stats',  (req, res, next) => {
		//TODO FIX CHAIN VALIDATION
		return res.render('stats', { blockchain: blockchain, nodes: blockchain.getNodes()});
	});

	/**
	 * Return list of nodes
	 */
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

	/**
	 * Return blockchain
	 */
	app.get('/blockchain', (req, res) => {
		return res.json(blockchain.getChain());
	});

	/**
	 * Check users balance
	 */
	app.post('/transaction/user', (req, res) => {
		const {publicKey} = req.body;

		blockchain.getBalance(publicKey).then((result) => {
			let canVote = false;

			if(result >= 1){
				canVote = true;
			}

			return res.json({
				valid: canVote
			});
		});
	});

	/**
	 * Add new node
	 */
	app.post('/nodes', (req, res) => {
		const { host, port } = req.body;
		let node = `http://${host}:${port}`;

		if(!nodeExists(blockchain, host, port)) {
			blockchain.addNode(new Node(socketListeners(client(node + `?cbaddr=${HOST}:${PORT}`, {
				'reconnection' : false
			}), blockchain), host, port));

			console.info(`Added node ${node}`);

			return res.json({
				status: 'Added node'
			});
		} else {
			return res.json({
				status: 'Rejected Node'
			})
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

/**
 * Check if node exists
 * @param blockchain
 * @param host
 * @param port
 * @returns {boolean}
 */
function nodeExists(blockchain, host, port){
	let nodes = blockchain.getNodes();

	for(let i = 0; i < nodes.length; i++){
		if(nodes[i].host === host && nodes[i].port === port){
			return true;
		}
	}
}

module.exports = BlockchainManager;
