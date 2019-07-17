//import Block from './block';

const Block = require('./block');
const constants = require('../constants');
const StringUtils = require('../utils/StringUtils');

const POOL_MAX = 10;

class Blockchain {

	constructor(socket){
		this.nodes = [];
		this.socket = socket;
	}

	initialize(blockchain){
		this.blockchain = blockchain || [];
		this.transactionPool = [];
	}

	isInitialized(){
		return !!this.blockchain;
	}

	addBlock(block){
		this.blockchain.push(block);
		//this.socket.emit(constants.END_MINING, this.blockchain());
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

	validateChain(difficulty){
		let previousBlock = null;

		for(let i = 0; i < this.blockchain.length; i++){
			let currentBlock = this.blockchain[i];

			if(i !== 0){
				previousBlock = this.blockchain[i - 1];
			}

			if(!this.compareHash(currentBlock)){
				return false;
			}

			if(i !== 0){
				this.validatePreviousHash(currentBlock, previousBlock);
			}

			if(!this.checkProof(currentBlock, difficulty)){
				return false;
			}

			//TODO: Verify transactions signature
			//TODO: Verify Merkle Root for block
		}

		return true;
	}

	validatePreviousHash(current, previous){
		return current.previousHash() === previous.hash;
	}

	checkProof(block, difficulty){
		let target = StringUtils.getProofString(difficulty);
		return block.hash.substring(0, difficulty) === target;
	}

	compareHash(currentBlock) {
		let hash = currentBlock.hash;
		let compare = currentBlock.calculateHash();

		return hash === compare;
	}

	getBalance(publickey){
		let bal = 0;

		for(let b = 0; b < this.blockchain.length; b++){

			let block = this.blockchain[b];

			for(let t = 0; t < this.blockchain[b]._data.length ; t++){

				let transaction = block._data[t];

				if(transaction.sender === publickey){
					bal -= parseInt(transaction.amount);
				}

				if(transaction.receiver === publickey){
					bal += parseInt(transaction.amount);
				}

			}

		}

		return bal;
	}
}

module.exports = Blockchain;
