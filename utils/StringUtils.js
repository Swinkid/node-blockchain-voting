import Crypto from 'crypto';

class StringUtils {

	static encodeSha256(input){
		return Crypto.createHash('sha256').update(input).digest('hex');
	}

}

module.exports = StringUtils;
