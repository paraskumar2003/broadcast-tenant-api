import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
export declare function createBullBoardServer(queues: Queue[]): ExpressAdapter;
