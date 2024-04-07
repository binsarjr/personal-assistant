import { type DynamicModule } from '@nestjs/common';
import { WhatsappAuthPrismaAdapter } from './adapter/auth-prisma-adapter';
import { WhatsappApiService } from './whatsapp-api.service';

export class WhatsappApiModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: WhatsappApiModule,
      providers: [WhatsappApiService, WhatsappAuthPrismaAdapter],
      exports: [WhatsappApiService, WhatsappAuthPrismaAdapter],
    };
  }
}
