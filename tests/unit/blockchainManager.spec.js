jest.mock('Axios', () => {

});

const blockchainManager = require('../../managers/blockchainManager');

describe('Sample Test', () => {
	it('should test that true === true', () => {

		expect(true).toBe(true)
	})
})
