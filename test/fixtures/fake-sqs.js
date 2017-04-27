'use strict'
const AWS = require('aws-sdk');
const sinon = require('sinon');

class SQS {
	getQueueUrl(opts, cb) {
		if(opts['QueueName'] !== 'unknownQueue'){
			cb(undefined, {QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/12345678912/somequeue'})
		}
		cb(undefined, {QueueUrl: ''})
		
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

const stubGetQueue = sinon.stub(sqs, 'getQueueUrl');
stubGetQueue.withArgs({QueueName: 'demoQueue', QueueOwnerAWSAccountId: '123456789111'}).yields(undefined, {QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/12345678912/somequeue'});
stubGetQueue.withArgs({QueueName: 'unknownQueue', QueueOwnerAWSAccountId: '123456789111'}).yields(undefined, {QueueUrl: ''});
const stubSendMessage = sinon.stub(sqs, 'sendMessage');
stubSendMessage.withArgs({MessageBody: 'Test', QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/12345678912/somequeue'}).yields(undefined, {MessageId: '123456789'});
stubSendMessage.withArgs({MessageBody: JSON.stringify({payload: 'something'}), QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/12345678912/somequeue'}).yields(undefined, {MessageId: '123456789'});