const Merkle = require('merkle');

const StringUtils = require('../utils/StringUtils');
const Transaction = require('./transaction');

class Block {

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

	getTransactionIds(){
		let transactionIds = [];

		this._data.forEach((transaction) => {
			transactionIds.push(transaction.transactionId);
		});

		return transactionIds;
	}

	calculateHash(){
		return StringUtils.encodeSha256(
			this._previousHash +
			this._data +
			this._timeStamp +
			this._nonce +
			this._merkle
		)
	}


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

	//proofWork(difficulty){
	//	let target = StringUtils.getProofString(difficulty);
	//
	//	while(this._hash.substring(0, difficulty) !== target){
	//		this._nonce = parseInt(this._nonce) + 1;
	//		this._hash = this.calculateHash();
	//	}
	//
	//}

	get previousHash() {
		return this._previousHash;
	}

	set previousHash(value) {
		this._previousHash = value;
	}

	get data() {
		return this._data;
	}

	set data(value) {
		this._data = value;
	}

	get timeStamp() {
		return this._timeStamp;
	}

	set timeStamp(value) {
		this._timeStamp = value;
	}

	get hash() {
		return this._hash;
	}

	set hash(value) {
		this._hash = value;
	}
}

module.exports = Block;
