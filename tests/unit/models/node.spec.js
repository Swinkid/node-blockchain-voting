const Node = require('../../../models/node');

const CLIENT = "localhost";
const HOST = "localhost";
const PORT = 9000;

const testedNode = new Node(CLIENT, HOST, PORT);

describe('Testing Node', () => {
	it('Client should be set', () => {
		expect(testedNode.client).toBe(CLIENT);
	});

	it('Client host be set', () => {
		expect(testedNode.host).toBe(HOST);
	});

	it('Client port be set', () => {
		expect(testedNode.port).toBe(PORT);
	});
});
