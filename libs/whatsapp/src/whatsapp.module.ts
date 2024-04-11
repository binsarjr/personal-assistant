import { WhatsappAuthService } from '@app/whatsapp/core/whatsapp-auth.service';
import { WhatsappConnectionService } from '@app/whatsapp/core/whatsapp-connection.service';
import { WhatsappMessageService } from '@app/whatsapp/core/whatsapp-message.service';
import { WhatsappStoreService } from '@app/whatsapp/core/whatsapp-store.service';
import { Module, type DynamicModule } from '@nestjs/common';

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
      exports: [WhatsappConnectionService],
    };
  }
}
