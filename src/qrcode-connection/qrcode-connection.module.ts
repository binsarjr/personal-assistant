import { Module } from '@nestjs/common';
import { QrcodeConnectionCommand } from './qrcode-connection.command';

@Module({
  providers: [QrcodeConnectionCommand],
})
export class QrcodeConnectionModule {}
