import PQueue from "p-queue";

export const Queue = new PQueue();

export const QueueMessage = new PQueue({ concurrency: 5 });
