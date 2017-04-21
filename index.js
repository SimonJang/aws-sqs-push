'use strict';
const AWS = require('aws-sdk');
const pify = require('pify');

const sqs = new AWS.SQS();
const request = pify(sqs.sendMessage.bind(sqs));
const getQueueUrl = pify(sqs.getQueueUrl.bind(sqs));

module.exports = (message, queueName, queueOwnerId) => {
	if (!message) {
		return Promise.reject(new TypeError('Please provide a message'));
	}
	if (!queueName) {
		return Promise.reject(new TypeError('Please provide a queue name'));
	}
	if (queueName.length > 80 && !/^[a-zA-Z0-9_-]{1,80}/i.test(queueName)) {
		return Promise.reject(new TypeError('Invalid queue name'));
	}

	return getQueueUrl(
		{
			QueueName: queueName,
			QueueOwnerAWSAccountId: queueOwnerId
		}
	).then(url => {
		if (url.QueueUrl) {
			return url.QueueUrl;
		}
		throw new Error('Queue not found');
	})
		.then(url => {
			return {
				MessageBody: message,
				QueueUrl: url
			};
		})
		.then(params => request(params));
};
