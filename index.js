'use strict';
const AWS = require('aws-sdk');
const isObj = require('is-obj');
const pify = require('pify');
const isAwsAccountId = require('is-aws-account-id');

const sqs = new AWS.SQS();
const sendMessage = pify(sqs.sendMessage.bind(sqs));
const getQueueUrl = pify(sqs.getQueueUrl.bind(sqs));

module.exports = (queueName, message, options) => {
	options = options || {};

	if (typeof queueName !== 'string') {
		return Promise.reject(new TypeError(`Expected \`queueName\` to be of type \`string\`, got \`${typeof queueName}\``));
	}
	if (typeof message !== 'string' && !isObj(message)) {
		return Promise.reject(new TypeError(`Expected \`message\` to be of type \`string\` or \`object\`, got \`${typeof message}\``));
	}
	if (!/^[a-z0-9_-]{1,80}$/i.test(queueName)) {
		return Promise.reject(new TypeError('Invalid queue name'));
	}
	if (options.awsAccountId && !isAwsAccountId(options.awsAccountId)) {
		return Promise.reject(new TypeError('Invalid AWS Account ID'));
	}

	message = isObj(message) ? JSON.stringify(message) : message;

	return getQueueUrl(
		{
			QueueName: queueName,
			QueueOwnerAWSAccountId: options.awsAccountId
		}
	)
	.then(data => {
		if (!data || !data.QueueUrl) {
			throw new TypeError(`Queue \`${queueName}\` not found`);
		}

		return data.QueueUrl;
	})
	.then(url => {
		return sendMessage({
			MessageBody: message,
			QueueUrl: url
		});
	})
	.then(result => result.MessageId);
};
