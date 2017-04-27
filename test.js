import test from 'ava';
import sinon from 'sinon';
import sqs from './test/fixtures/fake-sqs';
import m from './';

const sandbox = sinon.sandbox.create();

test.before(() => {
	sandbox.stub(process, 'env', {AWS_ACCOUNT_ID: '123456789111'});
});

test.after(() => {
	sandbox.restore();
});

test('error no message', async t => {
	t.throws(m(), 'Please provide a message');
});

test('error no queue name', async t => {
	t.throws(m('test'), 'Please provide a queue name');
});

test('invalid queue name test', async t => {
	t.throws(m('test', 'l[7777&&]l'), 'Invalid queue name');
});

test('invalid queueOwnerId test', async t => {
	sandbox.stub(process, 'env', {AWS_ACCOUNT_ID: '12'});
	t.throws(m('test', 'demoQueue'), 'Invalid queueOwnerId');
});

test('invalid queue not found test', t => {
	sandbox.stub(process, 'env', {AWS_ACCOUNT_ID: '123456789111'});
	t.throws(m('test', 'unknownQueue'), 'Queue not found');
});

test('should return MessageId value', async t => {
	const check = await m('Test', 'demoQueue');
	t.is(check, '123456789');
});

test('should work without setting the enviroment variables', async t => {
	sandbox.stub(process, 'env', {AWS_ACCOUNT_ID: ''});
	const check = await m('Test', 'demoQueue', {awsAccountId: '123456789111'});
	t.is(check, '123456789');
});

test('should stringify message when object', async t => {
	sandbox.stub(process, 'env', {AWS_ACCOUNT_ID: '123456789111'});
	await m({payload: 'something'}, 'demoQueue');
	t.deepEqual(sqs.sendMessage.lastCall.args[0], {
		MessageBody: JSON.stringify({payload: 'something'}),
		QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/12345678912/somequeue'
	});
});
