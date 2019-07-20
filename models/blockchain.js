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

	parseChain(blocks) {
		this.blockchain = blocks.map(block => {
			return new Block(null, null, block);
		});
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
		this.socket.emit(constants.STOP_WORK, this.blockchain);
	}

	getLastBlock(){
		return this.blockchain[this.blockchain.length - 1];
	}

	getChainLength(){
		return this.blockchain.length;
	}

	setChain(chain){
		this.blockchain = chain;
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

	async newTransaction(transaction){
		this.transactionPool.push(transaction);
		console.log(`Transaction added to transaction pool.`);

		if(this.transactionPool.length === POOL_MAX){
			console.log(`Transaction pool contains ${this.transactionPool.length} items. Bigger than ${POOL_MAX}, mining.`);
			process.env.BREAK = false;

			let block = new Block(this.getLastBlock().hash, this.transactionPool);
			let mine = block.proofWork(process.env.DIFFICULTY);

			this.transactionPool = [];

			if(mine !== 'true'){
				this.addBlock(block);
			}

		}

	}

	validateChain(difficulty){
		let previousBlock = null;

		for(let i = 0; i < this.getChainLength(); i++){
			let currentBlock = this.blockchain[i];

			if(i !== 0){
				previousBlock = this.blockchain[i - 1];
			}

			if(!Blockchain.compareHash(currentBlock)){
				return false;
			}

			if(i !== 0){
				Blockchain.validatePreviousHash(currentBlock, previousBlock);
			}

			if(!Blockchain.checkProof(currentBlock, difficulty)){
				return false;
			}

			//TODO: Verify transactions signature
			//TODO: Verify Merkle Root for block
		}

		return true;
	}

	static validatePreviousHash(current, previous){
		return current.previousHash() === previous.hash;
	}

	static checkProof(block, difficulty){
		let target = StringUtils.getProofString(difficulty);
		return block.hash.substring(0, difficulty) === target;
	}

	static compareHash(currentBlock) {
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
