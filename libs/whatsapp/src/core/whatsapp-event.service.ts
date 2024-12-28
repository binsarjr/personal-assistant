import { WhatsappEventActionMetadataKey } from '@app/whatsapp/constants';
import {
  DiscoveredMethodWithMeta,
  DiscoveryService,
} from '@golevelup/nestjs-discovery';
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
      [key in keyof BaileysEventMap]: DiscoveredMethodWithMeta<any>[];
    }> = {};

    providers.map(async (provider) => {
      const eventName = provider.meta as unknown as keyof BaileysEventMap;
      if (!handlers[eventName]) handlers[eventName] = [];
      handlers[eventName].push(provider);
    });

    for (const eventName in handlers) {
      if (!handlers[eventName]) continue;
      socket.ev.on(eventName as keyof BaileysEventMap, (...args) => {
        handlers[eventName].map((handler: DiscoveredMethodWithMeta<any>) => {
          const classInstance = handler.discoveredMethod.parentClass.instance;

          try {
            handler.discoveredMethod.handler.apply(classInstance, [
              socket,
              ...args,
            ]);
          } catch (error) {
            console.error(error);
          }
        });
      });
    }
  }
}
