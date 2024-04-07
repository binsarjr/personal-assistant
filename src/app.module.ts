import { Module } from '@nestjs/common';
import { HelloWorldCommand } from './hello-world-command/hello-world-command';
import { QrcodeConnectionModule } from './qrcode-connection/qrcode-connection.module';

@Module({
  imports: [QrcodeConnectionModule],
  providers: [HelloWorldCommand],
})
export class AppModule {}
