import { WhatsappEventActionMetadataKey } from '@app/whatsapp/constants';
import type { BaileysEventMap } from '@whiskeysockets/baileys';
import { applyMethodMetadata } from 'src/supports/decorator.support';

export const WAEvent = (eventName: keyof BaileysEventMap) =>
  applyMethodMetadata(eventName, WhatsappEventActionMetadataKey);
