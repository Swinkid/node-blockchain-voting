//import Block from './block';


class Blockchain {

	constructor(blockchain, socket){
		this.blockchain = blockchain || []; //TODO add genesis block?
		this.transactionPool = [];
		this.nodes = [];
		this.socket = socket;
	}

	addBlock(block){
		this.blockchain.push(block);
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

}

module.exports = Blockchain;
