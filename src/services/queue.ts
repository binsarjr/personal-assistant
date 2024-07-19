import PQueue from 'p-queue';

const LIMITIED_QUEUE = new PQueue({ concurrency: 2 });

export { LIMITIED_QUEUE };
