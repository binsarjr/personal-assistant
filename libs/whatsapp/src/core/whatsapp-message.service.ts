import {
  EligibleMetadataKey,
  WhatsappMessageActionMetadataKey,
} from '@app/whatsapp/constants';
import type { WhatsappMessageActionOptions } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import type { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { patternsAndTextIsMatch } from '@app/whatsapp/supports/flag.support';
import { getMessageCaption } from '@app/whatsapp/supports/message.support';
import {
  DiscoveryService,
  type DiscoveredClassWithMeta,
} from '@golevelup/nestjs-discovery';
import { Injectable } from '@nestjs/common';
import type {
  BaileysEventMap,
  WAMessage,
  WASocket,
} from '@whiskeysockets/baileys';
function cloneClassInstance<T>(instance: T): T {
  const clonedInstance = Object.create(Object.getPrototypeOf(instance));
  Object.assign(clonedInstance, instance);
  return clonedInstance;
}

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
    for (const provider of providers) {
      const instance = provider.discoveredClass
        .instance as WhatsappMessageAction;
      const meta = provider.meta as WhatsappMessageActionOptions;

      for (const message of messages) {
        const caption = getMessageCaption(message.message);

        if (typeof meta.flags !== 'undefined') {
          if (!patternsAndTextIsMatch(meta.flags, caption)) {
            continue;
          }
        }

        const isEligible = await this.eligibleMapInstance(
          provider,
          socket,
          message,
        );

        if (!isEligible) continue;

        instance.execute(socket, message);
      }
    }
  }

  protected async eligibleMapInstance(
    provider: DiscoveredClassWithMeta<unknown>,
    socket: WASocket,
    message: WAMessage,
  ) {
    const eligibles = await this.discoveryService.providerMethodsWithMetaAtKey(
      EligibleMetadataKey,
      (found) => {
        return found.name === provider.discoveredClass.name;
      },
    );

    let result = true;

    await Promise.all(
      eligibles.map(async (eligible) => {
        const classIntance = eligible.discoveredMethod.parentClass.instance;
        const instance = await eligible.discoveredMethod.handler.apply(
          classIntance,
          [socket, message],
        );

        if (!instance) result = false;
      }),
    );

    return result;
  }
}
