import { Module } from '@nestjs/common';
import { HelloWorldAction } from './hello-world.action';

@Module({
  providers: [HelloWorldAction],
})
export class WhatsappActionModule {}
