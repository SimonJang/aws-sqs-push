import test from 'ava';
import sinon from 'sinon';
import sqs from './fixtures/fake-sqs';
import m from './';

const sandbox = sinon.sandbox.create();

test.before(() => {
	const stub = sandbox.stub(sqs, 'sendMessage');
	stub.withArgs('Test', 'TestQueue', '1234').yields(undefined, {MessageId: 'Test'});
});

test.after(() => {
	sandbox.restore();
});

test('error', async t => {
	t.throws(m(), 'Please provide a message');
	t.throws(m('message'), 'Please provide a queue name');
});

test('queue', async t => {
	console.log('Checking "m" value: >> ', JSON.stringify(m('Test', 'TestQueue', '1234')));
	t.is(await m(), 'Test');
});
