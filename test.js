import test from 'ava';
import sqs from './test/fixtures/fake-sqs';
import m from './';

test('error no message', async t => {
	await t.throws(m(), 'Please provide a message');
});

test('error no queue name', async t => {
	await t.throws(m('test'), 'Please provide a queue name');
});

test('invalid queue name', async t => {
	await t.throws(m('test', 'l[7777&&]l'), 'Invalid queue name');
});

test('invalid account id', async t => {
	await t.throws(m('test', 'demoQueue', {awsAccountId: '12'}), 'Invalid queueOwnerId');
});

test('invalid queue not found', async t => {
	await t.throws(m('test', 'unknownQueue', {awsAccountId: '123456789111'}), 'Queue `unknownQueue` not found');
});

test('should return MessageId value', async t => {
	const result = await m('Test', 'demoQueue');
	t.is(result, '123456789');
});

test('should stringify message when object', async t => {
	await m({payload: 'something'}, 'demoQueue');
	t.deepEqual(sqs.sendMessage.lastCall.args[0], {
		MessageBody: JSON.stringify({payload: 'something'}),
		QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/123456789012/demoQueue'
	});
});
