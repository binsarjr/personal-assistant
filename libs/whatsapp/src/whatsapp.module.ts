import { Module, type DynamicModule } from '@nestjs/common';
import { WhatsappAuthService } from './core/whatsapp-auth.service';
import { WhatsappConnectionService } from './core/whatsapp-connection.service';
import { WhatsappMessageService } from './core/whatsapp-message.service';
import { WhatsappStoreService } from './core/whatsapp-store.service';

@Module({})
export class WhatsappModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: WhatsappModule,
      providers: [
        WhatsappAuthService,
        WhatsappConnectionService,
        WhatsappStoreService,
        WhatsappMessageService,
      ],
      exports: [],
    };
  }
}
