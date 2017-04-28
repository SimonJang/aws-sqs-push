'use strict';
const AWS = require('aws-sdk');
const isObj = require('is-obj');
const pify = require('pify');
const awsIDCheck = require('is-aws-account-id');

const sqs = new AWS.SQS();
const request = pify(sqs.sendMessage.bind(sqs));
const getQueueUrl = pify(sqs.getQueueUrl.bind(sqs));

module.exports = (queueName, message, options) => {
	options = options || {};

	if (!message) {
		return Promise.reject(new TypeError('Please provide a message'));
	}
	if (!queueName) {
		return Promise.reject(new TypeError('Please provide a queue name'));
	}
	if (queueName.length > 80 || !/^[a-zA-Z0-9_-]{1,80}$/i.test(queueName)) {
		return Promise.reject(new TypeError('Invalid queue name'));
	}
	if (options.awsAccountId && !awsIDCheck(options.awsAccountId)) {
		return Promise.reject(new TypeError('Invalid queueOwnerId'));
	}

	message = isObj(message) ? JSON.stringify(message) : message;

	return getQueueUrl(
		{
			QueueName: queueName,
			QueueOwnerAWSAccountId: options.awsAccountId
		}
	).then(data => {
		if (!data || !data.QueueUrl) {
			throw new TypeError(`Queue \`${queueName}\` not found`);
		}

		return data.QueueUrl;
	}).then(url => {
		return {
			MessageBody: message,
			QueueUrl: url
		};
	}).then(
		params => request(params)
	).then(result => result.MessageId);
};
