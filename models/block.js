const Merkle = require('merkle');

const StringUtils = require('../utils/StringUtils');
const Transaction = require('./transaction');

class Block {

	constructor(previousHash, data){
		this._timeStamp = new Date();
		this._hash = this.calculateHash();
		this._previousHash = previousHash;
		this._data = data;
		this._nonce = 0;
		this._merkle = Merkle('sha256').sync(this._data).root();
	}

	calculateHash(){
		return StringUtils.encodeSha256(
			this._previousHash +
			this._data +
			this._timeStamp +
			this._nonce
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
