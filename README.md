# aws-sqs-push [![Build Status](https://travis-ci.org/SimonJang/aws-sqs-push.svg?branch=master)](https://travis-ci.org/SimonJang/aws-sqs-push)

> Push messages to an AWS SQS queue


## Install

```
$ npm install --save aws-sqs-push
```


## Usage

```js
const sqspush = require('aws-sqs-push');

sqspush('SomeMessage', 'QueueName', 'UserAWSAccountID');
    // { MessageId: '123456789' }
```


## API

### aws-sqs-push(message, queueName, AWSAccountID)

#### input

Type: `string`

#### queueName

Type: `string`

#### AWSAccountID

Type: `string`

## License

MIT © [Simon](https://github.com/SimonJang)
