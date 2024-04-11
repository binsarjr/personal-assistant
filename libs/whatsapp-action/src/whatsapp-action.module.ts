import { Module } from '@nestjs/common';
import { PingAction } from './random/ping.action';
import { ScanQrCodeAction } from './scan-qr-code.action';

@Module({
  providers: [ScanQrCodeAction, PingAction],
})
export class WhatsappActionModule {}
