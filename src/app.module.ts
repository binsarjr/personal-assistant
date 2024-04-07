import { Module } from '@nestjs/common';
import { QrcodeConnectionModule } from './qrcode-connection/qrcode-connection.module';

@Module({
  imports: [QrcodeConnectionModule],
})
export class AppModule {}
