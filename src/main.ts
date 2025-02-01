import './core/di/bootstrap';

import { prisma } from '$infrastructure/database/db';
import { logger } from '$infrastructure/logger/console.logger';
import { WhatsappClient } from '$infrastructure/whatsapp/whatsapp-client';
import { $ } from 'bun';

await $`'clear`;
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

const whatsapp = new WhatsappClient(device.id, 'qrcode');

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
