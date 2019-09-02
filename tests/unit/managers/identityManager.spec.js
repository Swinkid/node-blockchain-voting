const identityManager = require('../../../managers/identityManager');

const testedIdentityManager = new identityManager();
const PUBLIC_KEY = "./public.pem";
const PRIVATE_KEY = "./private.pem";
const __basedir = "";

describe('identityManager.js', () => {
	it('Test construction of object', () => {
		expect(identityManager).not.toBeNull();
	})

	it('Test construction of tested object', () => {
		expect(testedIdentityManager).not.toBeNull();
	});

	it('Test getPrivateKey', () => {
		testedIdentityManager.initializeKeys();
		expect(testedIdentityManager.getPrivateKey()).not.toBeNull();
	})

	it('Test getPublicKey', () => {
		testedIdentityManager.initializeKeys();
		expect(testedIdentityManager.getPublicKey()).not.toBeNull();
	})

	it('Test SaveKey', () => {
		testedIdentityManager.initializeKeys();
		testedIdentityManager.initializeKeys();
	})

})
