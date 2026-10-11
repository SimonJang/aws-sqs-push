'use strict';

const assert = require('assert');
const AWS = require('aws-sdk');

assert.strictEqual(AWS.VERSION, '2.580.0');

const calls = [];
AWS.SQS.prototype.getQueueUrl = function (request) {
	calls.push(['getQueueUrl', request]);
	return {promise: function () {
		return Promise.resolve({QueueUrl: 'https://example.invalid/orders'});
	}};
};
AWS.SQS.prototype.sendMessage = function (request) {
	calls.push(['sendMessage', request]);
	return {promise: function () {
		return Promise.resolve({MessageId: 'node8-peer'});
	}};
};

const pushMessage = require('../lib');
assert.strictEqual(typeof pushMessage, 'function');
assert.strictEqual(pushMessage.default, pushMessage);

const timeout = setTimeout(function () {
	console.error(new Error('Node 8 peer smoke test did not settle'));
	process.exitCode = 1;
}, 1000);

pushMessage('orders', {MessageBody: 'hello'}).then(function (result) {
	clearTimeout(timeout);
	assert.deepStrictEqual(result, {MessageId: 'node8-peer'});
	assert.deepStrictEqual(calls, [
		['getQueueUrl', {QueueName: 'orders'}],
		['sendMessage', {
			MessageBody: 'hello',
			QueueUrl: 'https://example.invalid/orders'
		}]
	]);
}).catch(function (error) {
	clearTimeout(timeout);
	console.error(error);
	process.exitCode = 1;
});
