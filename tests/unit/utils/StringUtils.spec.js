const StringUtils = require('../../../utils/StringUtils');

const SHA_256_INPUT = "Testing";
const SHA_256_OUTPUT = "e806a291cfc3e61f83b98d344ee57e3e8933cccece4fb45e1481f1f560e70eb1";
const SHA_256_TARGET = "00000091cfc3e61f83b98d344ee57e3e8933cccece4fb45e1481f1f560e70eb1";

const PROOF_DIFFICULTY = 6;
const PROOF_STRING = "000000";

describe('Testing String Utils', () => {
	it('Should calculate SHA256', () => {
		let sha256 = StringUtils.encodeSha256(SHA_256_INPUT);
		expect(sha256).toBe(SHA_256_OUTPUT)
	});

	it('Should calculate proof string', () => {
		let proofDifficulty = StringUtils.getProofString(PROOF_DIFFICULTY);
		expect(proofDifficulty).toBe(PROOF_STRING);
	});

	it('Should validate proof', () => {
		let validatedProof = StringUtils.validateProof(PROOF_STRING, SHA_256_TARGET, PROOF_DIFFICULTY);
		expect(validatedProof).toBe(true);
	});
});
