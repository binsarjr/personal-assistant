import { WhatsappEventActionMetadataKey } from '@app/whatsapp/constants';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { Injectable } from '@nestjs/common';

import type { BaileysEventMap, WASocket } from '@whiskeysockets/baileys';

@Injectable()
export class WhatsappEventService {
  constructor(private readonly discoveryService: DiscoveryService) {}

  async bind(socket: WASocket) {
    const providers = await this.discoveryService.providerMethodsWithMetaAtKey(
      WhatsappEventActionMetadataKey,
    );

    const handlers: Partial<{
      [key in keyof BaileysEventMap]: any[];
    }> = {};

    providers.map(async (provider) => {
      const eventName = provider.meta as unknown as keyof BaileysEventMap;
      if (!handlers[eventName]) handlers[eventName] = [];
      handlers[eventName].push(provider.discoveredMethod.handler);
    });

    for (const eventName in handlers) {
      if (!handlers[eventName]) continue;
      socket.ev.on(eventName as keyof BaileysEventMap, (...args) => {
        handlers[eventName].map((handler) => handler(socket, ...args));
      });
    }
  }
}
