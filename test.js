import test from 'ava';
import sinon from 'sinon';
import sqs from './fixtures/fake-sqs';
import m from './';

const sandbox = sinon.sandbox.create();

test.before(() => {
	const stubGetQueue = sandbox.stub(sqs, 'getQueueUrl');
	stubGetQueue.withArgs({QueueName: 'demoQueue', QueueOwnerAWSAccountId: '123456789111'}).yields(undefined, {QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/12345678912/somequeue'});
	stubGetQueue.withArgs({QueueName: 'unknownQueue', QueueOwnerAWSAccountId: '123456789111'}).yields(undefined, {QueueUrl: ''});
	const stubSendMessage = sandbox.stub(sqs, 'sendMessage');
	stubSendMessage.withArgs({MessageBody: 'Test', QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/12345678912/somequeue'}).yields(undefined, {MessageId: '123456789'});
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
	t.throws(m('test', 'l[7777&&]l', '123456789111'), 'Invalid queue name');
});

test('invalid queueOwnerId test', async t => {
	t.throws(m('test', 'demoQueue', '12345'), 'Invalid queueOwnerId');
});

test('invalid queue not found test', t => {
	t.throws(m('test', 'unknownQueue', '123456789111'), 'Queue not found');
});

test('Should return MessageId value', async t => {
	const check = await m('Test', 'demoQueue', '123456789111');
	t.is(check.MessageId, '123456789');
});
