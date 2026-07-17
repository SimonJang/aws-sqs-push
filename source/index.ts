import * as AWS from 'aws-sdk';
import {SQS} from 'aws-sdk';
import clean = require('obj-clean');

type Request = Omit<SQS.Types.SendMessageRequest, 'QueueUrl'>;

const STANDARD_QUEUE_NAME = /^[A-Za-z0-9_-]{1,80}$/;
const FIFO_QUEUE_NAME = /^[A-Za-z0-9_-]{1,75}\.fifo$/;
const AWS_ACCOUNT_ID = /^\d{12}$/;

const isQueueName = (value: unknown): value is string =>
	typeof value === 'string' &&
	(STANDARD_QUEUE_NAME.test(value) || FIFO_QUEUE_NAME.test(value));

const isMessageRequest = (value: unknown): value is Request =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Push a message on an SQS standard or FIFO queue.
 *
 * @param queueName - Name of the queue that you want to push a message on.
 * @param request - (Meta)data to be pushed on the queue.
 * @param awsAccountId - AWS account ID, needed for cross-account communication.
 */
async function pushMessage(
	queueName: string,
	request: Request,
	awsAccountId?: string
): Promise<SQS.Types.SendMessageResult> {
	if (!isQueueName(queueName)) {
		throw new Error('Invalid queue name');
	}

	if (!isMessageRequest(request)) {
		throw new Error('Invalid message request');
	}

	if (
		awsAccountId !== undefined &&
		(typeof awsAccountId !== 'string' || !AWS_ACCOUNT_ID.test(awsAccountId))
	) {
		throw new Error('Invalid AWS Account ID');
	}

	const sqs = new AWS.SQS();
	const queueUrlRequest: SQS.Types.GetQueueUrlRequest = {QueueName: queueName};

	if (awsAccountId !== undefined) {
		queueUrlRequest.QueueOwnerAWSAccountId = awsAccountId;
	}

	const queueUrlData = await sqs.getQueueUrl(queueUrlRequest).promise();

	if (
		!queueUrlData ||
		typeof queueUrlData.QueueUrl !== 'string' ||
		queueUrlData.QueueUrl.length === 0
	) {
		throw new Error(`Queue \`${queueName}\` not found`);
	}

	const sendMessageRequest = clean({
		...request,
		QueueUrl: queueUrlData.QueueUrl
	}) as SQS.Types.SendMessageRequest;

	return sqs.sendMessage(sendMessageRequest).promise();
}

export default pushMessage;

module.exports = pushMessage;
module.exports.default = pushMessage;
