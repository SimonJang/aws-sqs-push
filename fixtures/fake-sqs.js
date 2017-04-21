'use strict'
const AWS = require('aws-sdk');

class SQS {
	getQueueUrl(opts, cb) {
		console.log('executing function getQueueUrl')
		cb(undefined, {QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/12345678912/somequeue'})
	}
	sendMessage(opts, cb) {
		console.log('executing function getQueueUrl')
		cb(undefined, {MessageId: '123456789'});
	}
}
const sqs = new SQS();

AWS.SQS = function () {
	return sqs;
};

module.exports = sqs;