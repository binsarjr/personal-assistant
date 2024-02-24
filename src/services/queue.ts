import PQueue from "p-queue";

export const Queue = new PQueue();

/**
 * Queue for messages
 */
export const QueueMessage = new PQueue({ concurrency: 5 });

/**
 * Queue for mutations
 * like: add, remove, update etc
 */
export const QueueMutation = new PQueue({ concurrency: 1 });
