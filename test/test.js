import test from 'ava';
import sqs from './fixtures/fake-sqs';
import m from '../';					// eslint-disable-line import/order

test('invalid queue name', async t => {
	await t.throws(m(), 'Expected `queueName` to be of type `string`, got `undefined`');
	await t.throws(m(1), 'Expected `queueName` to be of type `string`, got `number`');
	await t.throws(m('l[7777&&]l', 'test'), 'Invalid queue name');
});

test('invalid message', async t => {
	await t.throws(m('demoQueue'), 'Expected `message` to be of type `string` or `object`, got `undefined`');
	await t.throws(m('demoQueue', 1), 'Expected `message` to be of type `string` or `object`, got `number`');
});

test('invalid account id', async t => {
	await t.throws(m('demoQueue', 'test', {awsAccountId: '12'}), 'Invalid AWS Account ID');
});

test('invalid queue not found', async t => {
	await t.throws(m('unknownQueue', 'test', {awsAccountId: '123456789111'}), 'Queue `unknownQueue` not found');
});

test('should return MessageId value', async t => {
	const result = await m('demoQueue', 'Test');
	t.is(result, '123456789');
});

test('should stringify message when object', async t => {
	await m('demoQueue', {payload: 'something'});
	t.deepEqual(sqs.sendMessage.lastCall.args[0], {
		MessageBody: JSON.stringify({payload: 'something'}),
		QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/123456789012/demoQueue'
	});
});
