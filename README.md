# aws-sqs-push [![Build Status](https://travis-ci.org/SimonJang/aws-sqs-push.svg?branch=master)](https://travis-ci.org/SimonJang/aws-sqs-push)

> Push messages to an AWS SQS (FIFO) queue

Small wrapper around the `getQueueUrl` and `sendMessage` from the AWS SQS SDK. This will automatically retrieve the queue url when sending a message. This is useful when you only have the queue name.

## Requirements

- Node >= 8.

## Install

```
$ npm install --save aws-sqs-push
```


## Usage

```js
const sqsPush = require('aws-sqs-push');

const request = {
	MessageBody: JSON.stringify({message: 'foo'});
	DelaySeconds: 10
}

sqsPush('QueueName', request, '123456789101').then(sendMessageResponse => {
    // ...
});

const fifoRequest = {
	messageDeduplicationId: '12312333331323'
	messageGroupId: '8875gyukjdsioop90123',
	MessageBody: JSON.stringify({message: 'FIFO'});
}

sqsPush('QueueName.fifo', fifoRequest).then(sendMessageResponse => {
	// ...
});
```


## API

### sqsPush(queueName, request, [awsAccountId])

Result is the response of the [AWS SQS sendMessage API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#sendMessage-property)

#### queueName

Required: `true`
Type: `string`

Name of the queue you want to push a message to. This can be a cross account queue but permissions must be granted to able to push on that queue.

#### request

Required: `true`
Type: `object`

Request properties are defined in the documentation of the `sendMessage` method of the [AWS SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#sendMessage-property)

##### awsAccountId

Required: `false`
Type: `string`

AWS account id of the owner of the queue. This optional parameter allows to push on cross account queue.

## License

MIT © [Simon Jang](https://github.com/SimonJang)
