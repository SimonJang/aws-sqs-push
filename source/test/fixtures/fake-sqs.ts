import * as AWS from 'aws-sdk';
import {SQS as SQSTypes} from 'aws-sdk'; // tslint:disable-line
import * as sinon from 'sinon';

interface AWSPromiseResult<T> {
	promise(): Promise<T | undefined>;
}

class SQS {
	getQueueUrl(
		request: SQSTypes.Types.GetQueueUrlRequest
	): AWSPromiseResult<Partial<SQSTypes.Types.GetQueueUrlResult>> {
		return {
			// tslint:disable-next-line:no-unnecessary-type-annotation
			promise: async (): Promise<Partial<SQSTypes.Types.GetQueueUrlResult> | undefined> => {
				if (!request.QueueName || request.QueueName === 'unknownQueue') {
					return Promise.resolve(undefined);
				}

				const accountId = request.QueueOwnerAWSAccountId || '123456789012';

				return Promise.resolve({
					QueueUrl: `https://sqs.eu-west-1.amazonaws.com/${accountId}/${request.QueueName}`
				});
			}
		};
	}

	sendMessage({
		MessageBody,
		QueueUrl,
		MessageGroupId
	}: SQSTypes.Types.SendMessageRequest): AWSPromiseResult<Partial<SQSTypes.Types.SendMessageResult>> {
		return {
			// tslint:disable-next-line:no-unnecessary-type-annotation
			promise: async (): Promise<Partial<SQSTypes.Types.SendMessageResult> | undefined> => {
				if (
					MessageBody === JSON.stringify({payload: 'something'}) &&
					QueueUrl === 'https://sqs.eu-west-1.amazonaws.com/123456789012/demoQueue'
				) {
					return Promise.resolve({
						MessageId: '123456789'
					});
				}

				if (QueueUrl === 'https://sqs.eu-west-1.amazonaws.com/123456789012/somequeue.fifo' && MessageGroupId) {
					return Promise.resolve({MessageId: '1337'});
				}

				return;
			}
		};
	}
}
const sqs = new SQS();

// tslint:disable-next-line:only-arrow-functions typedef
(AWS as any).SQS = function() {
	return sqs;
};

export default sqs;

sinon.spy(sqs, 'sendMessage');
