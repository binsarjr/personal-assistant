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
import { Cron } from 'croner';
import { parsePhoneNumber } from 'libphonenumber-js';

setInterval(
  async () => {
    await $`clear`.nothrow();
  },
  10 * 60 * 1000,
);

let name = Bun.env.BOT_NAME || 'personal-asistant';
// Cek argumen CLI
const usePairingCode = process.argv.includes('--pairing-code');
const connectUsing = usePairingCode ? 'pairing' : 'qrcode';
let phoneNumber: string | undefined = undefined;

if (usePairingCode) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function askPhoneNumber(): Promise<string> {
    return new Promise((resolve) => {
      rl.question(
        'Masukkan nomor telepon (cth: +6281234567890): ',
        (answer: string) => {
          resolve(answer.trim());
        },
      );
    });
  }

  let valid = false;
  while (!valid) {
    // eslint-disable-next-line no-await-in-loop
    const input = await askPhoneNumber();
    try {
      const parsed = parsePhoneNumber(input);
      if (parsed.isValid()) {
        phoneNumber = parsed.number;
        valid = true;
      } else {
        console.log('Nomor tidak valid. Coba lagi.');
      }
    } catch (e) {
      console.log('Format nomor tidak valid. Coba lagi.');
    }
  }
  rl.close();
}

const whatsapp = new WhatsappClient(name, connectUsing, wa_store, phoneNumber);
await whatsapp.initialize();

logger.info('WhatsApp client initialized 🚀');

new Cron(
  '0 0 7,13,18,21 * * *',
  {
    timezone: 'Asia/Jakarta',
  },
  async () => {
    const socket = await whatsapp.getClient();
    socket.sendMessage(socket.user!.id, {
      text: 'BOT MASIH BERJALAN',
    });
  },
);
