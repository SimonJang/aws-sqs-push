import pushMessage from '../lib';
import {SQS} from 'aws-sdk';

const request: Omit<SQS.Types.SendMessageRequest, 'QueueUrl'> = {
	MessageBody: 'hello',
	MessageGroupId: 'group'
};

const result: Promise<SQS.Types.SendMessageResult> = pushMessage(
	'orders.fifo',
	request,
	'123456789012'
);

void result;
