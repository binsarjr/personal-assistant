import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../libs/prisma/src';
import { WhatsappApiModule } from '../libs/whatsapp-api/src';
import { WhatsappModule } from '../libs/whatsapp/src';
import { ScanQrCodeCommand } from './commands/scan-qr-code.command';
import { TestingWhatsapp } from './services/testing.whatsapp';

@Module({
  imports: [
    PrismaModule.forRoot(),
    WhatsappApiModule.forRoot(),
    DiscoveryModule,
    WhatsappModule.forRoot(),
  ],
  providers: [ScanQrCodeCommand, TestingWhatsapp],
})
export class AppModule {}
