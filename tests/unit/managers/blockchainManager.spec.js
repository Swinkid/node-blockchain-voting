jest.mock('Axios', () => {

});

const blockchainManager = require('../../../managers/blockchainManager');

describe('blockchainManager.js', () => {
	it('Test construction of object', () => {
		expect(blockchainManager).not.toBeNull();
	})
})
