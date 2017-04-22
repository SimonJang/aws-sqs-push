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
	if (queueName.length > 80 || !/^[a-zA-Z0-9_-]{1,80}$/i.test(queueName)) {
		return Promise.reject(new TypeError('Invalid queue name'));
	}
	if (!queueOwnerId || queueOwnerId.length !== 12 || !/([0-9]{12})+/i.test(queueOwnerId)) {
		return Promise.reject(new TypeError('Invalid queueOwnerId'));
	}

	return getQueueUrl(
		{
			QueueName: queueName,
			QueueOwnerAWSAccountId: queueOwnerId
		}
	).then(url => {
		if (url.QueueUrl && url.QueueUrl.length !== 0) {
			return url.QueueUrl;
		}
		return Promise.reject(new TypeError('Queue not found'));
	})
		.then(url => {
			return {
				MessageBody: message,
				QueueUrl: url
			};
		})
		.then(params => request(params));
};
