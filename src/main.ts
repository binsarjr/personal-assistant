import { $ } from 'bun';
await $`'clear`;

import './core/di/bootstrap';
BaileysDecorator.loadDecorators([]);

import { prisma } from '$infrastructure/database/db';
import { logger } from '$infrastructure/logger/console.logger';
import makeInMemoryStore from '$infrastructure/whatsapp/make-in-memory-store';
import { WhatsappClient } from '$infrastructure/whatsapp/whatsapp-client';
import { hidden_path } from '$support/file.support';
import { BaileysDecorator } from 'baileys-decorators';

setInterval(
  async () => {
    await $`'clear`;
  },
  10 * 60 * 1000,
);

let name = 'personal-asistant';
const device = await prisma.device.upsert({
  where: {
    name: name,
  },
  create: {
    name: name,
  },
  update: {},
});

const useStore = process.argv.includes('--store');

logger.info(`Using store: ${useStore}`);

const store = useStore ? makeInMemoryStore({ logger }) : undefined;
if (store) {
  const pathlocation = hidden_path(`baileys_store_multi-${device.id}.json`);
  store?.readFromFile(pathlocation);
  // save every 10s
  setInterval(() => {
    store?.writeToFile(pathlocation);
  }, 10_000);
}

const whatsapp = new WhatsappClient(device.id, 'qrcode', store);

await whatsapp.initialize();

logger.info('WhatsApp client initialized 🚀');

{
  // sementara
  setInterval(async () => {
    const count = await prisma.whatsappMessage.count();
    const res = await prisma.whatsappMessage.deleteMany({
      where: {
        messageTimeUtc: {
          lt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        },
      },
    });
    logger.info(`total saved message: ${count}`);
    logger.info(`deleted saved message: ${res.count}`);
  }, 60 * 1_000);
}
