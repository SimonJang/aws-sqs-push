'use strict';
const AWS = require('aws-sdk');
const pify = require('pify');

const sqs = new AWS.SQS();

module.exports = (message, queueName, queueOwnerId) => {
	let queueHttp = '';

	if (!message) {
		return Promise.reject(new TypeError('Please provide a message'));
	}
	if (!queueName) {
		return Promise.reject(new TypeError('Please provide a queue name'));
	}
	if (queueName.length > 80 && !/^[a-zA-Z0-9_-]{1,80}/i.test(queueName)) {
		return Promise.reject(new TypeError('Invalid queueName'));
	}
	const getQueueUrl = pify(sqs.getQueueUrl.bind(sqs));
	queueHttp = getQueueUrl(
		{
			QueueName: queueName,
			QueueOwnerAWSAccountId: queueOwnerId
		}
	).then(url => url.QueueUrl);

	const messageParams = {
		MessageBody: message,
		QueueUrl: queueHttp
	};

	return pify(sqs.sendMessage.bind(sqs))(messageParams).then(data => data.MessageId);
};
