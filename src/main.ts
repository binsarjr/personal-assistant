import { $ } from 'bun';
await $`'clear`;

BaileysDecorator.loadDecorators([base_path('src/modules/**/*.handler.ts')]);

import { logger } from '$infrastructure/logger/console.logger';
import { WhatsappClient } from '$infrastructure/whatsapp/whatsapp-client';
import wa_store from '$infrastructure/whatsapp/whatsapp-store';
import { base_path } from '$support/file.support';
import { BaileysDecorator } from 'baileys-decorators';

setInterval(
  async () => {
    await $`'clear`;
  },
  10 * 60 * 1000,
);

let name = Bun.env.BOT_NAME || 'personal-asistant';

const whatsapp = new WhatsappClient(name, 'qrcode', wa_store);

await whatsapp.initialize();

logger.info('WhatsApp client initialized 🚀');
