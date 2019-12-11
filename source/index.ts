import * as AWS from 'aws-sdk';
import {SQS} from 'aws-sdk'; // tslint:disable-line:no-duplicate-imports
import * as isAwsAccountId from 'is-aws-account-id';
import {isAWSFifoQueue} from 'is-aws-fifo-queue';
import * as clean from 'obj-clean';

const sqs = new AWS.SQS();

type Request = Omit<SQS.Types.SendMessageRequest, 'QueueUrl'>;

/**
 * Push a message on a SQS (FIFO) queue.
 *
 * @param queueName - Name of the queue to push a message on.
 * @param message - Message to be pushed on the queue.
 * @param options - Additional configuration for the message.
 */
export async function pushMessage(
	queueName: string,
	request: Request,
	awsAccountId?: string
): Promise<SQS.Types.SendMessageResult> {
	if (!/^[a-z0-9_-]{1,80}$/i.test(queueName) && !isAWSFifoQueue(queueName)) {
		throw TypeError('Invalid queue name');
	}

	// tslint:disable-next-line:no-unsafe-any
	if (awsAccountId && !isAwsAccountId(awsAccountId)) {
		throw TypeError('Invalid AWS Account ID');
	}

	const queueUrlData = await sqs
		.getQueueUrl({
			QueueName: queueName,
			QueueOwnerAWSAccountId: awsAccountId
		})
		.promise();

	if (!queueUrlData || !queueUrlData.QueueUrl) {
		throw new TypeError(`Queue \`${queueName}\` not found`);
	}

	return sqs
		.sendMessage(
			clean({
				QueueUrl: queueUrlData.QueueUrl,
				...request
			}) as SQS.Types.SendMessageRequest
		)
		.promise();
}
