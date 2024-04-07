import { Command, CommandRunner } from 'nest-commander';
import { PrismaService } from '../../libs/prisma/src';
import { WhatsappAuthPrismaAdapter } from '../../libs/whatsapp-api/src/adapter/auth-prisma-adapter';
import { WhatsappConnection } from '../../libs/whatsapp-api/src/core/whatsapp-connection';
import { Logger } from '../services/logger';

@Command({
  name: 'scan-qr-code',
  description: 'Scan QR code',
})
export class ScanQrCodeCommand extends CommandRunner {
  constructor(
    private readonly db: PrismaService,
    private readonly authStore: WhatsappAuthPrismaAdapter,
  ) {
    super();
  }
  async run() {
    const logger = Logger();
    const device = await this.db.device.upsert({
      where: {
        name: 'mymac',
      },
      update: {
        name: 'mymac',
      },
      create: {
        id: '1',
        name: 'mymac',
      },
    });

    const wapi = new WhatsappConnection(
      await this.authStore.make(device.id),
      Logger(),
    );
    wapi.connectToWhatsapp();
  }
}
