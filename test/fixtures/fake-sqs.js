'use strict'
const AWS = require('aws-sdk');
const sinon = require('sinon');

class SQS {
	getQueueUrl(opts, cb) {
		if (!opts.QueueName || opts.QueueName === 'unknownQueue') {
			cb(undefined, null);
			return;
		}

		const accountId = opts.QueueOwnerAWSAccountId || '123456789012';

		cb(undefined, {QueueUrl: `https://sqs.eu-west-1.amazonaws.com/${accountId}/${opts.QueueName}`})
	}

	sendMessage(opts, cb) {
		cb(undefined, {MessageId: '123456789'});
	}
}
const sqs = new SQS();

AWS.SQS = function () {
	return sqs;
};

module.exports = sqs;

const stubSendMessage = sinon.stub(sqs, 'sendMessage');
stubSendMessage.withArgs({MessageBody: 'Test', QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/123456789012/demoQueue'}).yields(undefined, {MessageId: '123456789'});
stubSendMessage.withArgs({MessageBody: JSON.stringify({payload: 'something'}), QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/123456789012/demoQueue'}).yields(undefined, {MessageId: '123456789'});
