// tslint:disable:no-unsafe-any
import test from 'ava';
import sqs from './fixtures/fake-sqs';
import {pushMessage} from '../index';
import {SinonStub} from 'sinon';

test('should throw error when invalid account id is provided', async t => {
	await t.throwsAsync(
		pushMessage(
			'demoQueue',
			{
				MessageBody: JSON.stringify('foo')
			},
			'12'
		),
		'Invalid AWS Account ID'
	);
});

test('should fail when an invalid queuename is provided', async t => {
	await t.throwsAsync(
		pushMessage(
			'.1',
			{
				MessageBody: JSON.stringify('foo')
			},
			'123456789111'
		),
		'Invalid queue name'
	);
	await t.throwsAsync(
		pushMessage(
			'fifo.bar',
			{
				MessageBody: JSON.stringify('foo')
			},
			'123456789111'
		),
		'Invalid queue name'
	);
	await t.throwsAsync(
		pushMessage(
			'FOO BAR',
			{
				MessageBody: JSON.stringify('foo')
			},
			'123456789111'
		),
		'Invalid queue name'
	);
});

test('should throw error when queue is not found', async t => {
	await t.throwsAsync(
		pushMessage(
			'unknownQueue',
			{
				MessageBody: JSON.stringify('foo')
			},
			'123456789111'
		),
		'Queue `unknownQueue` not found'
	);
});

test('should publish a message on a queue', async t => {
	await pushMessage('someQueue', {
		MessageBody: JSON.stringify('foo'),
		DelaySeconds: 10,
		MessageAttributes: {
			date: {
				DataType: 'string',
				StringValue: '2018-01-01'
			}
		}
	});

	t.deepEqual((sqs.sendMessage as SinonStub).lastCall.args[0], {
		QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/123456789012/someQueue',
		MessageBody: '"foo"',
		DelaySeconds: 10,
		MessageAttributes: {
			date: {
				DataType: 'string',
				StringValue: '2018-01-01'
			}
		}
	});
});

test.serial('should provide push message on a FIFO queue', async t => {
	await pushMessage('somequeue.fifo', {
		MessageBody: JSON.stringify({message: 'Hello FIFO queue'}),
		MessageGroupId: '123411233123113',
		MessageDeduplicationId: '123ixxttfiokue'
	});

	t.deepEqual((sqs.sendMessage as SinonStub).lastCall.args[0], {
		MessageBody: JSON.stringify({message: 'Hello FIFO queue'}),
		MessageGroupId: '123411233123113',
		MessageDeduplicationId: '123ixxttfiokue',
		QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/123456789012/somequeue.fifo'
	});
});
