'use strict';
const AWS = require('aws-sdk');
const pify = require('pify');

const sqs = new AWS.SQS();
const request = pify(sqs.sendMessage.bind(sqs));
const getQueueUrl = pify(sqs.getQueueUrl.bind(sqs));

module.exports = (message, queueName, options) => {
	options = Object.assign({
		awsAccountId: process.env.AWS_ACCOUNT_ID
	}, options);

	if (!message) {
		return Promise.reject(new TypeError('Please provide a message'));
	}
	if (!queueName) {
		return Promise.reject(new TypeError('Please provide a queue name'));
	}
	if (queueName.length > 80 || !/^[a-zA-Z0-9_-]{1,80}$/i.test(queueName)) {
		return Promise.reject(new TypeError('Invalid queue name'));
	}
	if (!options.awsAccountId || options.awsAccountId.length !== 12 || !/([0-9]{12})+/i.test(options.awsAccountId)) {
		return Promise.reject(new TypeError('Invalid queueOwnerId'));
	}

	return getQueueUrl(
		{
			QueueName: queueName,
			QueueOwnerAWSAccountId: options.awsAccountId
		}
	).then(url => {
		if (!url.QueueUrl && url.QueueUrl.length === 0) {
			return Promise.reject(new TypeError('Queue not found'));
		}
		return url.QueueUrl;
	}).then(url => {
		return {
			MessageBody: message,
			QueueUrl: url
		};
	}).then(
		params => request(params)
	).then(result => result.MessageId);
};
