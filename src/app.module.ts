import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../libs/prisma/src';
import { WhatsappActionModule } from '../libs/whatsapp-action/src';
import { WhatsappModule } from '../libs/whatsapp/src';

@Module({
  imports: [
    PrismaModule.forRoot(),
    DiscoveryModule,
    WhatsappModule.forRoot(),
    WhatsappActionModule,
  ],
  providers: [],
})
export class AppModule {}
