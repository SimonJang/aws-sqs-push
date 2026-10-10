# aws-sqs-push

> Push messages to an AWS SQS standard or FIFO queue

This small wrapper resolves a queue URL from its name and then calls the AWS SDK v2 `sendMessage` API.

## Requirements

- Node.js 8 or newer
- `aws-sdk` v2 installed by the consuming application

The latest AWS SDK v2 releases require Node.js 10 or newer. Node.js 8 consumers must pin an SDK release that still supports Node.js 8; CI verifies `aws-sdk@2.580.0` as the peer-range minimum. AWS SDK v2 is end-of-support, but this package retains its v2 API to avoid a breaking change in a maintenance release.

Source and Git builds use Node.js 8-compatible dependencies. The full contributor test suite runs on modern Node.js/npm and installs its current SDK/compiler tools separately in `test/modern`; those tools are not required to prepare a Git dependency. CI checks fresh Git installs on Node.js 8 with npm 5 and 6 and strict engine checks enabled.

## Install

```sh
npm install aws-sqs-push aws-sdk
```

## Usage

```js
const sqsPush = require('aws-sqs-push');

const request = {
	MessageBody: JSON.stringify({message: 'foo'}),
	DelaySeconds: 10
};

sqsPush('QueueName', request, '123456789101').then(sendMessageResponse => {
	// ...
});

const fifoRequest = {
	MessageBody: JSON.stringify({message: 'FIFO'}),
	MessageDeduplicationId: '12312333331323',
	MessageGroupId: '8875gyukjdsioop90123'
};

sqsPush('QueueName.fifo', fifoRequest).then(sendMessageResponse => {
	// ...
});
```

## API

### sqsPush(queueName, request, [awsAccountId])

Returns the response from the AWS SDK v2 [`SQS.sendMessage`](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#sendMessage-property) operation.

#### queueName

Type: `string`

Name of the queue to push a message to. Standard queue names may contain alphanumeric characters, hyphens, and underscores. FIFO queue names use the same character set and end in `.fifo`.

#### request

Type: `object`

Request properties accepted by the AWS SDK v2 `sendMessage` operation, except `QueueUrl`. The package resolves and supplies the queue URL itself.

#### awsAccountId

Type: `string` (optional)

The 12-digit AWS account ID of the queue owner. Use this for a cross-account queue after granting the required permissions.

## License

MIT © [Simon Jang](https://github.com/SimonJang)
