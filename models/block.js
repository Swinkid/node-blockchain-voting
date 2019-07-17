const Merkle = require('merkle');

const StringUtils = require('../utils/StringUtils');
const Transaction = require('./transaction');

class Block {

	constructor(previousHash, data){
		this._timeStamp = Date.now();
		this._previousHash = previousHash;
		this._data = data;
		this._nonce = 0;
		this._merkle = Merkle('sha256').sync(this.getTransactionIds()).root();
		this._hash = this.calculateHash();
	}

	getTransactionIds(){
		let transactionIds = [];

		for(let d = 0; d < this._data.length; d++){
			transactionIds.push(this._data[d].transactionId);
		}

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
		let target = StringUtils.getProofString(difficulty);

		while(this._hash.substring(0, difficulty) !== target){
			this._nonce = parseInt(this._nonce) + 1;
			this._hash = this.calculateHash();
		}

	}

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
