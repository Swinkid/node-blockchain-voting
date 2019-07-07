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

	removeNode(host, port){

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
