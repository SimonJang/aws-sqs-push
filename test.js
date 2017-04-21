import test from 'ava';
import sinon from 'sinon';
import sqs from './fixtures/fake-sqs';
import m from './';

const sandbox = sinon.sandbox.create();

test.before(() => {
	const stubGetQueue = sandbox.stub(sqs, 'getQueueUrl');
	stubGetQueue.withArgs({QueueName: 'demoQueue', QueueOwnerAWSAccountId: '1234'}).yields(undefined, {QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/12345678912/somequeue'});
	const stubSendMessage = sandbox.stub(sqs, 'sendMessage');
	stubSendMessage.withArgs({MessageBody: 'Test', QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/12345678912/somequeue'}).yields(undefined, {MessageId: '123456789'});
});

test.after(() => {
	sandbox.restore();
});

test('error', async t => {
	t.throws(m(), 'Please provide a message');
	t.throws(m('message'), 'Please provide a queue name');
});

test('Should return value', async t => {
	const check = await m('Test', 'demoQueue', '1234');
	t.is(check.MessageId, '123456789');
});
