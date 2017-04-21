'use strict'
const AWS = require('aws-sdk');

class SQS {
	sendMessage(params, cb) {
		console.log('params: ', params);
		console.log('callback', cb);
		cb(undefined, {MessageId: '8a98f4d0-078b-5176-9af2-bbd871660ecb'});
	}
}

const sqs = new SQS();

AWS.SQS = function () {
	return sqs;
};

module.exports = sqs;