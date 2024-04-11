import { WhatsappMessageActionMetadataKey } from '@app/whatsapp/constants';
import type { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import type { Flags } from '@app/whatsapp/types/flags.type';
import type { Type } from '@nestjs/common';
import { applyClassMetadata } from 'src/supports/decorator.support';

type WhatsappMessageDecorator = <TFunction extends Type<WhatsappMessageAction>>(
  target: TFunction,
) => void | TFunction;

export interface WhatsappMessageActionOptions {
  flags: Flags;
}

export const WhatsappMessage = (
  options: Partial<WhatsappMessageActionOptions> = {},
): WhatsappMessageDecorator =>
  applyClassMetadata(options, WhatsappMessageActionMetadataKey);
