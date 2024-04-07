import { type DynamicModule } from '@nestjs/common';
import { WhatsappApiService } from './whatsapp-api.service';

export class WhatsappApiModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: WhatsappApiModule,
      providers: [WhatsappApiService],
      exports: [WhatsappApiService],
    };
  }
}
