import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { Injectable } from '@nestjs/common';
import type { BaileysEventMap, WASocket } from '@whiskeysockets/baileys';
import { WhatsappMessageActionMetadataKey } from '../constants';
import type { WhatsappMessageActionOptions } from '../decorators/whatsapp-message.decorator';
import type { WhatsappMessageAction } from '../interfaces/whatsapp.interface';
import { patternsAndTextIsMatch } from '../supports/flag.support';
import { getMessageCaption } from '../supports/message.support';

@Injectable()
export class WhatsappMessageService {
  constructor(private readonly discoveryService: DiscoveryService) {}

  async execute(
    socket: WASocket,
    { messages, type }: BaileysEventMap['messages.upsert'],
  ) {
    const providers = await this.discoveryService.providersWithMetaAtKey(
      WhatsappMessageActionMetadataKey,
    );
    providers.map((provider) => {
      const instance = provider.discoveredClass
        .instance as WhatsappMessageAction;
      const meta = provider.meta as WhatsappMessageActionOptions;

      for (const message of messages) {
        const caption = getMessageCaption(message.message);

        if (patternsAndTextIsMatch(meta.flags, caption)) {
          instance.execute(socket, message);
        }
      }
    });
  }
}
