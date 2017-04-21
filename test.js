import test from 'ava';
import sinon from 'sinon';
import sqs from './fixtures/fake-sqs';
import m from './';

const sandbox = sinon.sandbox.create();

test.before(() => {
	const stub = sandbox.stub(sqs, 'sendMessage');
	stub.withArgs({Message: 'foo', TopicArn: 'arn:aws:sns:us-west-2:111122223333:MyTopic'}).yields(undefined, {MessageId: 'foo'});
	stub.withArgs({Message: 'foo', TargetArn: 'arn:aws:sns:us-west-2:111122223333:GCM/MyTopic'}).yields(undefined, {MessageId: 'bar'});
	stub.withArgs({Message: 'foo', TopicArn: 'arn:aws:sns:us-west-2:111122223333:MyTopic', Subject: 'Hello World'}).yields(undefined, {MessageId: 'baz'});
	stub.yields(undefined, {MessageId: 'bla'});
});

test.after(() => {
	sandbox.restore();
});

test('error', t => {
	t.throws(m(), 'Please provide a message');
	t.throws(m('message'), 'Please provide a queue name');
});
