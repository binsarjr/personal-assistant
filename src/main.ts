process.env.TZ = 'Asia/Jakarta';
Bun.env.TZ = 'Asia/Jakarta';

import { $ } from 'bun';
await $`clear`.nothrow();

BaileysDecorator.loadDecorators([base_path('src/modules/**/*.handler.ts')]);

import { logger } from '$infrastructure/logger/console.logger';
import { WhatsappClient } from '$infrastructure/whatsapp/whatsapp-client';
import wa_store from '$infrastructure/whatsapp/whatsapp-store';
import { base_path } from '$support/file.support';
import { BaileysDecorator } from 'baileys-decorators';
import { CronJob } from 'cron';

setInterval(
  async () => {
    await $`clear`.nothrow();
  },
  10 * 60 * 1000,
);

let name = Bun.env.BOT_NAME || 'personal-asistant';

const whatsapp = new WhatsappClient(name, 'qrcode', wa_store);

await whatsapp.initialize();

logger.info('WhatsApp client initialized 🚀');

new CronJob(
  '0 0 7,13,18,21 * * *', // cronTime
  async function () {
    const socket = await whatsapp.getClient();
    socket.sendMessage(socket.user!.id, {
      text: 'BOT MASIH BERJALAN',
    });
  }, // onTick
  null, // onComplete
  true, // start
  'Asia/Jakarta', // timeZone
);
