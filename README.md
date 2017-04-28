# aws-sqs-push [![Build Status](https://travis-ci.org/SimonJang/aws-sqs-push.svg?branch=master)](https://travis-ci.org/SimonJang/aws-sqs-push)

> Push messages to an AWS SQS queue


## Install

```
$ npm install --save aws-sqs-push
```


## Usage

```js
const sqsPush = require('aws-sqs-push');

sqsPush('QueueName', 'SomeMessage').then(messageId => {
    console.log(messageId);
    //=> '8a98f4d0-078b-5176-9af2-bbd871660ecb'
});

sqsPush('QueueName', 'SomeMessage', {awsAccountId: '123456789101'}).then(messageId => {
    console.log(messageId);
    //=> '8a98f4d0-078b-5176-9af2-bbd871660ecb'
});
```


## API

### sqsPush(queueName, message, [options])

#### queueName

Type: `string`

Name of the queue you want to push a message to.

#### message

Type: `string` `object`

Message that you want to push into queue.

#### options

##### options.awsAccountId

Type: `string`

AWS account ID of the account that created the queue.


## License

MIT © [Simon Jang](https://github.com/SimonJang)
