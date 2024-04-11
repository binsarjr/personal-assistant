import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/src';
import { WhatsappConnectionService } from '../../whatsapp/src/core/whatsapp-connection.service';

@Injectable()
export class ScanQrCodeAction {
  constructor(
    private readonly whatsappConnection: WhatsappConnectionService,
    private readonly prisma: PrismaService,
  ) {}
  async scan(deviceName: string) {
    const device = await this.prisma.device.upsert({
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
    this.whatsappConnection.connectToWhatsapp(device.id);
  }
}
