'use strict';

const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');

const implementationPath = require.resolve('../lib');

const createHarness = (options = {}) => {
	const calls = {
		constructors: 0,
		getQueueUrl: [],
		sendMessage: []
	};
	const sentResult = options.sentResult || {MessageId: 'message-id'};

	class FakeSQS {
		constructor() {
			calls.constructors += 1;
		}

		getQueueUrl(request) {
			calls.getQueueUrl.push(request);
			return {
				promise: async () => {
					if (options.getQueueUrlError) {
						throw options.getQueueUrlError;
					}

					return Object.prototype.hasOwnProperty.call(options, 'queueUrlResult')
						? options.queueUrlResult
						: {QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/123456789012/orders'};
				}
			};
		}

		sendMessage(request) {
			calls.sendMessage.push(request);
			return {
				promise: async () => {
					if (options.sendMessageError) {
						throw options.sendMessageError;
					}

					return sentResult;
				}
			};
		}
	}

	delete require.cache[implementationPath];
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

	return {calls, pushMessage, sentResult};
};

test('exports the callable CommonJS API and default-import interop', () => {
	const {pushMessage} = createHarness();

	assert.equal(typeof pushMessage, 'function');
	assert.equal(pushMessage.default, pushMessage);
});

test('rejects invalid queue names before constructing an SQS client', async () => {
	const invalidNames = [
		undefined,
		null,
		123,
		'',
		'.1',
		'fifo.bar',
		'FOO BAR',
		'a'.repeat(81),
		`${'a'.repeat(76)}.fifo`,
		'orders.FIFO'
	];

	for (const queueName of invalidNames) {
		const {calls, pushMessage} = createHarness();
		await assert.rejects(
			pushMessage(queueName, {MessageBody: 'hello'}),
			/Invalid queue name/
		);
		assert.equal(calls.constructors, 0);
	}
});

test('accepts the documented standard and FIFO queue-name boundaries', async () => {
	for (const queueName of ['a', 'Orders_2026-test', 'a'.repeat(80), 'a.fifo', `${'a'.repeat(75)}.fifo`]) {
		const {calls, pushMessage} = createHarness();
		await pushMessage(queueName, {MessageBody: 'hello'});
		assert.equal(calls.getQueueUrl[0].QueueName, queueName);
	}
});

test('rejects malformed account IDs before constructing an SQS client', async () => {
	for (const accountId of ['', '12', '12345678901x', 123456789012, null]) {
		const {calls, pushMessage} = createHarness();
		await assert.rejects(
			pushMessage('orders', {MessageBody: 'hello'}, accountId),
			/Invalid AWS Account ID/
		);
		assert.equal(calls.constructors, 0);
	}
});

test('rejects malformed message requests before constructing an SQS client', async () => {
	for (const request of [undefined, null, [], 'hello', 123]) {
		const {calls, pushMessage} = createHarness();
		await assert.rejects(pushMessage('orders', request), /Invalid message request/);
		assert.equal(calls.constructors, 0);
	}
});

test('omits an absent queue owner and includes a valid cross-account owner', async () => {
	const local = createHarness();
	await local.pushMessage('orders', {MessageBody: 'hello'});
	assert.deepEqual(local.calls.getQueueUrl[0], {QueueName: 'orders'});

	const crossAccount = createHarness();
	await crossAccount.pushMessage('orders', {MessageBody: 'hello'}, '123456789012');
	assert.deepEqual(crossAccount.calls.getQueueUrl[0], {
		QueueName: 'orders',
		QueueOwnerAWSAccountId: '123456789012'
	});
});

test('throws the established not-found error for missing queue URL results', async () => {
	for (const queueUrlResult of [undefined, null, {}, ...['', 0, 1, true, {}, []].map(QueueUrl => ({QueueUrl}))]) {
		const {calls, pushMessage} = createHarness({queueUrlResult});
		await assert.rejects(
			pushMessage('unknownQueue', {MessageBody: 'hello'}),
			/Queue `unknownQueue` not found/
		);
		assert.deepEqual(calls.sendMessage, []);
	}
});

test('uses the resolved queue URL, preserves FIFO fields and cleaning, and returns the SDK result', async () => {
	const resolvedUrl = 'https://sqs.eu-west-1.amazonaws.com/123456789012/orders.fifo';
	const harness = createHarness({queueUrlResult: {QueueUrl: resolvedUrl}});
	const request = {
		QueueUrl: 'https://attacker.invalid/queue',
		MessageBody: 'hello',
		DelaySeconds: 0,
		MessageGroupId: 'group',
		MessageDeduplicationId: 'dedup',
		MessageAttributes: {
			kept: {DataType: 'String', StringValue: 'value'},
			removed: {DataType: '', StringValue: null}
		},
		MessageSystemAttributes: undefined
	};

	const snapshot = structuredClone(request);
	const result = await harness.pushMessage('orders.fifo', request);

	assert.equal(result, harness.sentResult);
	assert.deepEqual(harness.calls.sendMessage[0], {
		QueueUrl: resolvedUrl,
		MessageBody: 'hello',
		DelaySeconds: 0,
		MessageGroupId: 'group',
		MessageDeduplicationId: 'dedup',
		MessageAttributes: {
			kept: {DataType: 'String', StringValue: 'value'}
		}
	});
	assert.deepEqual(request, snapshot);
});

test('forwards getQueueUrl and sendMessage promise rejections unchanged', async () => {
	const lookupFailure = new Error('lookup failed');
	const lookup = createHarness({getQueueUrlError: lookupFailure});
	await assert.rejects(
		lookup.pushMessage('orders', {MessageBody: 'hello'}),
		error => error === lookupFailure
	);

	const sendFailure = new Error('send failed');
	const send = createHarness({sendMessageError: sendFailure});
	await assert.rejects(
		send.pushMessage('orders', {MessageBody: 'hello'}),
		error => error === sendFailure
	);
});
