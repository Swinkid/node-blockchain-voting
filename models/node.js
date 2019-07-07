const client = require('socket.io-client');

class Node {
	constructor(client, host, port) {
		this.client = client;
		this.host = host;
		this.port = port;
	}
}

module.exports = Node;
