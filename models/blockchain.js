//import Block from './block';

const Block = require('./block');
const constants = require('../constants');

const POOL_MAX = 10;

class Blockchain {

	constructor(socket){
		this.nodes = [];
		this.socket = socket;
	}

	initialize(blockchain){
		this.blockchain = blockchain || []; //TODO add genesis block?
		this.transactionPool = [];
	}

	isInitialized(){
		return !!this.blockchain;
	}

	addBlock(block){
		this.blockchain.push(block);
		this.socket.emit(constants.END_MINING, this.blockchain());
		console.log(`Added new block... Chain: ${this.blockchain}`)
	}

	lastBlock(){
		return this.blockchain[this.blockchain.length - 1];
	}

	getChainLength(){
		return this.blockchain.length;
	}

	addNode(node){
		this.nodes.push(node);
	}

	getChain(){
		return this.blockchain;
	}

	removeNode(host, port){
		for(var i = 0; i < this.nodes.length; i++){
			if(this.nodes[i].host === host  && this.nodes[i].port === port){
				this.nodes.splice(i, 1);
			}
		}
	}

	getNode(host, port){
		this.nodes.forEach(function (node) {
			if(node.host === host && node.port === port){
				return node;
			}
		});
	}

	getNodeIndex(host, port){
		let index = 0;
		this.nodes.forEach(function (node) {
			if((node.host === host) && (node.port === port)){
				return index;
			}

			index++;
		});
	}

	getNodes(){
		return this.nodes;
	}

	setNodes(nodes){
		this.nodes = nodes;
	}

}

module.exports = Blockchain;
