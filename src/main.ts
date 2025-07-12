process.env.TZ = 'Asia/Jakarta';
Bun.env.TZ = 'Asia/Jakarta';

// Jangan load decorators/log sebelum CLI!
// BaileysDecorator.loadDecorators([base_path('src/modules/**/*.handler.ts')]);

import { logger } from '$infrastructure/logger/console.logger';
import { WhatsappClient } from '$infrastructure/whatsapp/whatsapp-client';
import { base_path } from '$support/file.support';
import { BaileysDecorator } from 'baileys-decorators';
import { Cron } from 'croner';
import { runCLI } from './cli';

let name = Bun.env.BOT_NAME || 'personal-asistant';

async function main() {
  console.log('🚀 Personal Assistant - WhatsApp Bot');
  console.log('=' .repeat(50));

  // Jalankan CLI untuk mendapatkan options
  const options = await runCLI();
  
  if (!options) {
    console.log('👋 Sampai jumpa!');
    process.exit(0);
  }

  // Setelah CLI selesai, baru load decorators (agar log tidak mengganggu prompt)
  BaileysDecorator.loadDecorators([base_path('src/modules/**/*.handler.ts')]);

  const { session: deviceId, mode, phone: phoneNumber } = options;

  console.log(`\n📱 Starting WhatsApp client...`);
  console.log(`   Session: ${deviceId}`);
  console.log(`   Mode: ${mode}`);
  if (phoneNumber) {
    console.log(`   Phone: ${phoneNumber}`);
  }
  console.log('=' .repeat(50));

  const whatsapp = new WhatsappClient(deviceId!, mode!, phoneNumber);
  await whatsapp.initialize();

  logger.info('WhatsApp client initialized 🚀');

  // Cron job untuk keep-alive
  new Cron(
    '0 0 7,13,18,21 * * *',
    {
      timezone: 'Asia/Jakarta',
    },
    async () => {
      try {
        const socket = await whatsapp.getClient();
        await socket.sendMessage(socket.user!.id, {
          text: `🤖 BOT MASIH BERJALAN\n📅 ${new Date().toLocaleString('id-ID')}\n🔧 Session: ${deviceId}`,
        });
        logger.info('Keep-alive message sent');
      } catch (error) {
        logger.error('Failed to send keep-alive message:', error);
      }
    },
  );

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    try {
      const socket = await whatsapp.getClient();
      await socket.sendMessage(socket.user!.id, {
        text: `🔴 BOT SHUTTING DOWN\n📅 ${new Date().toLocaleString('id-ID')}\n🔧 Session: ${deviceId}`,
      });
    } catch (error) {
      logger.error('Failed to send shutdown message:', error);
    }
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    process.exit(0);
  });
}

// Jalankan main function
main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
