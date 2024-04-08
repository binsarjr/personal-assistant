import type { WASocket } from '@whiskeysockets/baileys';
import { Command, CommandRunner } from 'nest-commander';
import { PrismaService } from '../../libs/prisma/src';
import { WhatsappAuthPrismaAdapter } from '../../libs/whatsapp-api/src/adapter/auth-prisma-adapter';
import { WhatsappConnection } from '../../libs/whatsapp-api/src/core/whatsapp-connection';
import { Logger } from '../services/logger';

@Command({
  name: 'scan-qr-code',
  description: 'Scan QR code',
  arguments: '<device-name>',
})
export class ScanQrCodeCommand extends CommandRunner {
  constructor(
    private readonly db: PrismaService,
    private readonly authStore: WhatsappAuthPrismaAdapter,
  ) {
    super();
  }

  async run(inputs) {
    const deviceName = inputs[0];

    const device = await this.db.device.upsert({
      where: {
        name: deviceName,
      },
      update: {
        name: deviceName,
      },
      create: {
        name: deviceName,
      },
    });
    const logger = Logger({ name: 'ScanQrCodeCommand-' + deviceName });
    const wapi = new WhatsappConnection(
      await this.authStore.make(device.id),
      logger,
    );

    await new Promise(async (resolve) => {
      wapi.onSocket((socket: WASocket) => {
        socket.ev.on('connection.update', async (update) => {
          console.log('connection.update', update);
          if (update.connection === 'open') {
            resolve('connected');
          }
        });
      });
      wapi.connectToWhatsapp();
    });

    return;
  }
}
