# aws-sqs-push [![Build Status](https://travis-ci.org/SimonJang/aws-sqs-push.svg?branch=master)](https://travis-ci.org/SimonJang/aws-sqs-push)

> Push messages to an AWS SQS queue


## Install

```
$ npm install --save aws-sqs-push
```


## Usage

```js
const sqsPush = require('aws-sqs-push');

sqsPush('SomeMessage', 'QueueName', {}).then(messageId => {
    console.log(messageId);
    //=> '8a98f4d0-078b-5176-9af2-bbd871660ecb'
});
```


## API

### sqsPush(message, queueName, [options])

#### message


Type: `string`

Message that you want to push into queue.

#### queueName

Type: `string`

Name of the queue you want to push a message to.

#### options
the `options` object contains the AWS Account ID. Required unless provived in the environment variables of the lambda. See [AWS Lambda documentation](http://docs.aws.amazon.com/lambda/latest/dg/env_variables.html) for more information.

Type: `object`

##### options.awsAccountId

Type: `string`

ID of the root user of the AWS Account.

## License

MIT © [Simon Jang](https://github.com/SimonJang)
