import { Module } from '@nestjs/common';
import { HelloWorldAction } from './hello-world.action';
import { ScanQrCodeAction } from './scan-qr-code.action';

@Module({
  providers: [ScanQrCodeAction, HelloWorldAction],
})
export class WhatsappActionModule {}
