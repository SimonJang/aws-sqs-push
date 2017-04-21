# aws-sqs-push [![Build Status](https://travis-ci.org/SimonJang/sqslibrary.svg?branch=master)](https://travis-ci.org/SimonJang/sqslibrary)

> Push messages to an AWS SQS queue


## Install

```
$ npm install --save aws-sqs-push
```


## Usage

```js
const sqspush = require('aws-sqs-push');

sqspush('SomeMessage', 'QueueName', 'UserAWSAccountID');
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
