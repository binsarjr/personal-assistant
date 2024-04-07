import { Module } from '@nestjs/common';
import { PrismaModule } from '../libs/prisma/src';
import { WhatsappApiModule } from '../libs/whatsapp-api/src';
import { ScanQrCodeCommand } from './commands/scan-qr-code.command';

@Module({
  imports: [PrismaModule.forRoot(), WhatsappApiModule.forRoot()],
  providers: [ScanQrCodeCommand],
})
export class AppModule {}
