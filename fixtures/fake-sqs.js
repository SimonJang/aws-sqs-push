'use strict'
const AWS = require('aws-sdk');

class SQS {
	sendMessage(params) {
		console.log(params)
	}
}

const sqs = new SQS();

AWS.SQS = function () {
	return sqs;
};

module.exports = sqs;