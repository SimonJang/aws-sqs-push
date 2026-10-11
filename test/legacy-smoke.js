'use strict';

const assert = require('assert');
const Module = require('module');

const calls = [];
function FakeSQS() {}
FakeSQS.prototype.getQueueUrl = function (request) {
	calls.push(['getQueueUrl', request]);
	return {promise: function () {
		return Promise.resolve({QueueUrl: 'https://example.invalid/orders'});
	}};
};
FakeSQS.prototype.sendMessage = function (request) {
	calls.push(['sendMessage', request]);
	return {promise: function () {
		return Promise.resolve({MessageId: 'legacy'});
	}};
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
	if (request === 'aws-sdk') {
		return {SQS: FakeSQS};
	}

	return originalLoad.call(this, request, parent, isMain);
};

let pushMessage;
try {
	pushMessage = require('../lib');
} finally {
	Module._load = originalLoad;
}

assert.strictEqual(typeof pushMessage, 'function');
assert.strictEqual(pushMessage.default, pushMessage);

const timeout = setTimeout(function () {
	console.error(new Error('Legacy smoke test did not settle'));
	process.exitCode = 1;
}, 1000);

pushMessage('orders', {MessageBody: 'hello'}).then(function (result) {
	clearTimeout(timeout);
	assert.deepStrictEqual(result, {MessageId: 'legacy'});
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
