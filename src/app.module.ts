import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../libs/prisma/src';
import { WhatsappActionModule } from '../libs/whatsapp-action/src';
import { WhatsappApiModule } from '../libs/whatsapp-api/src';
import { WhatsappModule } from '../libs/whatsapp/src';
import { ScanQrCodeCommand } from './commands/scan-qr-code.command';

@Module({
  imports: [
    PrismaModule.forRoot(),
    WhatsappApiModule.forRoot(),
    DiscoveryModule,
    WhatsappModule.forRoot(),
    WhatsappActionModule,
  ],
  providers: [ScanQrCodeCommand],
})
export class AppModule {}
