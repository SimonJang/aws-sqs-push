import * as AWS from 'aws-sdk';
import {SQS} from 'aws-sdk'; // tslint:disable-line:no-duplicate-imports
import * as isAwsAccountId from 'is-aws-account-id';
import {isAWSFifoQueue} from 'is-aws-fifo-queue';
import * as clean from 'obj-clean';

type Request = Omit<SQS.Types.SendMessageRequest, 'QueueUrl'>;

/**
 * Push a message on a SQS (FIFO) queue.
 *
 * @param queueName - Name of the queue that you want to push a message on.
 * @param request - (Meta)data to be pushed on the queue.
 * @param awsAccountId - AWS account id, needed for cross account communication.
 */
export async function pushMessage(
	queueName: string,
	request: Request,
	awsAccountId?: string
): Promise<SQS.Types.SendMessageResult> {
	const sqs = new AWS.SQS();

	if (!/^[a-z0-9_-]{1,80}$/i.test(queueName) && !isAWSFifoQueue(queueName)) {
		throw Error('Invalid queue name');
	}

	// tslint:disable-next-line:no-unsafe-any
	if (awsAccountId && !isAwsAccountId(awsAccountId)) {
		throw Error('Invalid AWS Account ID');
	}

	// Retrieve queue URL. This is needed for the `sendMessage` API.
	const queueUrlData = await sqs
		.getQueueUrl({
			QueueName: queueName,
			QueueOwnerAWSAccountId: awsAccountId
		})
		.promise();

	if (!queueUrlData || !queueUrlData.QueueUrl) {
		throw new Error(`Queue \`${queueName}\` not found`);
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
