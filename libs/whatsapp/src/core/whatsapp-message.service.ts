import {
  EligibleMetadataKey,
  WhatsappMessageActionMetadataKey,
} from '@app/whatsapp/constants';
import type { WhatsappMessageActionOptions } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import {
  Emoji,
  type WhatsappMessageAction,
} from '@app/whatsapp/interfaces/whatsapp.interface';
import { patternsAndTextIsMatch } from '@app/whatsapp/supports/flag.support';
import {
  getMessageCaption,
  react,
} from '@app/whatsapp/supports/message.support';
import {
  DiscoveryService,
  type DiscoveredClassWithMeta,
} from '@golevelup/nestjs-discovery';
import { Injectable } from '@nestjs/common';
import {
  jidNormalizedUser,
  type BaileysEventMap,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';

@Injectable()
export class WhatsappMessageService {
  constructor(private readonly discoveryService: DiscoveryService) {}

  async execute(
    socket: WASocket,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

        try {
          await instance.execute(socket, message);
        } catch (error) {
          await react(socket, Emoji.Failed, message);
          await socket.sendMessage(
            jidNormalizedUser(socket.user.id),
            {
              text: error.toString(),
            },
            { quoted: message },
          );
        }
      }
    }
  }

  protected async eligibleMapInstance(
    provider: DiscoveredClassWithMeta<unknown>,
    socket: WASocket,
    message: WAMessage,
  ) {
    const eligible = await this.discoveryService.providerMethodsWithMetaAtKey(
      EligibleMetadataKey,
      (found) => {
        // Include both the class itself and its superclass methods.
        return (
          found.name === provider.discoveredClass.name ||
          Object.getPrototypeOf(found.name).name ===
            provider.discoveredClass.name
        );
      },
    );

    let result = true;

    await Promise.all(
      eligible.map(async (eligible) => {
        const classInstance = eligible.discoveredMethod.parentClass.instance;
        const instance = await eligible.discoveredMethod.handler.apply(
          classInstance,
          [socket, message],
        );

        if (!instance) result = false;
      }),
    );

    return result;
  }
}
