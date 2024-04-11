import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { Injectable } from '@nestjs/common';
import type { BaileysEventMap, WASocket } from '@whiskeysockets/baileys';
import { WhatsappMessageActionMetadataKey } from '../constants';
import type { WhatsappMessageAction } from '../interfaces/whatsapp.interface';

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
      for (const message of messages) {
        instance.execute(socket, message);
      }
    });
  }
}
