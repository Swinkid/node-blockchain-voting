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

	/**
	 * Create blockchain from String
	 * @param blocks
	 */
	parseChain(blocks) {
		this.blockchain = blocks.map(block => {
			return new Block(null, null, block);
		});
	}

	/**
	 * Initialize empty blockchain
	 * @param blockchain
	 */
	initialize(blockchain){
		this.blockchain = blockchain || [];
		this.transactionPool = [];
	}

	/**
	 * Check if blockchain is initalized
	 * @returns {boolean}
	 */
	isInitialized(){
		return !!this.blockchain;
	}

	/**
	 * Add block to chain
	 * @param block
	 */
	addBlock(block){
		this.blockchain.push(block);
		this.socket.emit(constants.STOP_WORK, this.blockchain);
	}

	/**
	 * Return last block of chain
	 * @returns {*}
	 */
	getLastBlock(){
		return this.blockchain[this.blockchain.length - 1];
	}

	/**
	 * Return blockchain length
	 * @returns {*}
	 */
	getChainLength(){
		return this.blockchain.length;
	}

	/**
	 * Set blockchain array
	 * @param chain
	 */
	setChain(chain){
		this.blockchain = chain;
	}

	/**
	 * Add node
	 * @param node
	 */
	addNode(node){
		this.nodes.push(node);
	}

	/**
	 * Get chain
	 * @returns {*}
	 */
	getChain(){
		return this.blockchain;
	}

	/**
	 * Remove Node
	 * @param host
	 * @param port
	 */
	removeNode(host, port){
		for(var i = 0; i < this.nodes.length; i++){
			if(this.nodes[i].host === host  && this.nodes[i].port === port){
				this.nodes.splice(i, 1);
			}
		}
	}

	/**
	 * Get Node
	 * @param host
	 * @param port
	 */
	getNode(host, port){
		this.nodes.forEach(function (node) {
			if(node.host === host && node.port === port){
				return node;
			}
		});
	}

	/**
	 * Remove node at index
	 * @param host
	 * @param port
	 */
	getNodeIndex(host, port){
		let index = 0;
		this.nodes.forEach(function (node) {
			if((node.host === host) && (node.port === port)){
				return index;
			}

			index++;
		});
	}

	/**
	 * Return node array
	 * @returns {[]|Array}
	 */
	getNodes(){
		return this.nodes;
	}

	/**
	 * Set Node array
	 * @param nodes
	 */
	setNodes(nodes){
		this.nodes = nodes;
	}

	/**
	 * Add new transaction
	 * @param transaction
	 * @returns {Promise<void>}
	 */
	async newTransaction(transaction){

		if(transaction.verifyTransaction()){

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

	}

	/**
	 * Validate chain integrity
	 * @param difficulty
	 * @returns {boolean}
	 */
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

	/**
	 * Validate Previous Block's Hash
	 * @param current
	 * @param previous
	 * @returns {boolean}
	 */
	static validatePreviousHash(current, previous){
		return current.previousHash() === previous.hash;
	}

	/**
	 * Check proof is correct
	 * @param block
	 * @param difficulty
	 * @returns {boolean}
	 */
	static checkProof(block, difficulty){
		let target = StringUtils.getProofString(difficulty);
		return block.hash.substring(0, difficulty) === target;
	}

	/**
	 * Validate block hash
	 * @param currentBlock
	 * @returns {boolean}
	 */
	static compareHash(currentBlock) {
		let hash = currentBlock.hash;
		let compare = currentBlock.calculateHash();

		return hash === compare;
	}

	/**
	 * Return balance of specific key
	 * @param publickey
	 * @returns {Promise<unknown>}
	 */
	getBalance(publickey){
		return new Promise(resolve => {
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

			resolve(bal);
		})
	}
}

module.exports = Blockchain;
