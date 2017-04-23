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
Optional

Type: `object`

Reserved for future use.

## License

MIT © [Simon Jang](https://github.com/SimonJang)
