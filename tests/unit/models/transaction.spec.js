const Transaction = require('../../../models/transaction');
const StringUtils = require('../../../utils/StringUtils');

const SENDER = "abcabcabc";
const RECEIVER = "cbacbacba";
const SENDER_PRIVATE_KEY = "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgoIezMjIg0pj8ypDws2lTSm6nhW7Ilm3ShwLYF+Ubr06hRANCAAQh5yf4pGGOPnjnDv5gkJ64cwNIRXPua8DsdLWe8NCkNWTU7+TflYcIkXKCExAWDb9O5b1kbygWnzLXz8kFJpKk";
const AMOUNT = 1;
const TRANSACTION = undefined;

const CALCULATED_HASH = "99af8721962cba3deb176f61bd5c0dc5f85fe9658fbd4f5933773db8d46f494c";


const testedTransaction = new Transaction(SENDER, RECEIVER, AMOUNT, SENDER_PRIVATE_KEY, TRANSACTION);

describe('Testing String Utils', () => {
	it('Should validate proof', () => {
		let calculatedHash = testedTransaction.calculateHash();
		expect(calculatedHash).toBe(CALCULATED_HASH);
	});
});
