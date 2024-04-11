import { PrismaService } from '@app/prisma';
import { WhatsappConnectionService } from '@app/whatsapp';
import { Injectable } from '@nestjs/common';

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
