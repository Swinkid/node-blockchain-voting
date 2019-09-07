const Merkle = require('merkle');

const StringUtils = require('../utils/StringUtils');
const Transaction = require('./transaction');

class Block {

	/**
	 * Block Constructor
	 * @param previousHash
	 * @param data
	 * @param block
	 */
	constructor(previousHash, data, block){
		if(block !== undefined){
			this.parseBlock(block)
		} else {
			this._timeStamp = Date.now();
			this._previousHash = previousHash;
			this._data = data;
			this._nonce = 0;
			this._merkle = Merkle('sha256').sync(this.getTransactionIds()).root();
			this._hash = this.calculateHash();
		}
	}

	/**
	 * Covert string based block to object
	 * @param block
	 */
	parseBlock(block) {
		this._timeStamp = block._timeStamp;
		this._previousHash = block._previousHash;

		this._data = block._data.map(transaction => {
			return new Transaction(null, null, null, null, transaction);
		});

		this._nonce = block._nonce;
		this._merkle = block._merkle;
		this._hash = block.hash;
	}

	/**
	 * Return Transaction ID's for block
	 * @returns {[]}
	 */
	getTransactionIds(){
		let transactionIds = [];

		this._data.forEach((transaction) => {
			transactionIds.push(transaction.transactionId);
		});

		return transactionIds;
	}

	/**
	 * Calculate block hash string
	 * @returns {string}
	 */
	calculateHash(){
		return StringUtils.encodeSha256(
			this._previousHash +
			this._data +
			this._timeStamp +
			this._nonce +
			this._merkle
		)
	}

	/**
	 * Proof the block
	 * @param difficulty
	 */
	proofWork(difficulty){
		new Promise((resolve) => {
			setImmediate(async () => {
				this._nonce = parseInt(this._nonce) + 1;
				this._hash = this.calculateHash();

				let targetProof = StringUtils.getProofString(difficulty);

				if(StringUtils.validateProof(targetProof, this.hash, difficulty) || process.env.BREAK === 'true'){
					resolve(process.env.BREAK);
				} else {
					resolve(await this.proofWork(difficulty));
				}
			});
		});
	}

	/**
	 * Return previous hash
	 * @returns {*}
	 */
	get previousHash() {
		return this._previousHash;
	}

	/**
	 * Set previous hash
	 * @param value
	 */
	set previousHash(value) {
		this._previousHash = value;
	}

	/**
	 * Get data
	 * @returns {*}
	 */
	get data() {
		return this._data;
	}

	/**
	 * Set Data
	 * @param value
	 */
	set data(value) {
		this._data = value;
	}

	/**
	 * Get Block Timestamp
	 * @returns {number}
	 */
	get timeStamp() {
		return this._timeStamp;
	}

	/**
	 * Set timestamp
	 * @param value
	 */
	set timeStamp(value) {
		this._timeStamp = value;
	}

	/**
	 * Get Hash
	 * @returns {*}
	 */
	get hash() {
		return this._hash;
	}

	/**
	 * Set hash
	 * @param value
	 */
	set hash(value) {
		this._hash = value;
	}
}

module.exports = Block;
