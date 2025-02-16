import { $ } from 'bun';
await $`'clear`;

import './core/di/bootstrap';
BaileysDecorator.loadDecorators([]);

import { logger } from '$infrastructure/logger/console.logger';
import { WhatsappClient } from '$infrastructure/whatsapp/whatsapp-client';
import { BaileysDecorator } from 'baileys-decorators';

setInterval(
  async () => {
    await $`'clear`;
  },
  10 * 60 * 1000,
);

let name = 'personal-asistant';

const whatsapp = new WhatsappClient(name, 'qrcode');

await whatsapp.initialize();

logger.info('WhatsApp client initialized 🚀');
