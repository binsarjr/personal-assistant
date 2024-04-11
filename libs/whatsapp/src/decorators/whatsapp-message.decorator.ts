import type { Type } from '@nestjs/common';
import { applyClassMetadata } from '../../../../src/supports/decorator.support';
import { WhatsappMessageActionMetadataKey } from '../constants';
import type { WhatsappMessageAction } from '../interfaces/whatsapp.interface';
import type { Flags } from '../types/flags.type';

type WhatsappMessageDecorator = <TFunction extends Type<WhatsappMessageAction>>(
  target: TFunction,
) => void | TFunction;

interface Options {
  flags: Flags;
}

export const WhatsappMessage = (options?: Options): WhatsappMessageDecorator =>
  applyClassMetadata({}, WhatsappMessageActionMetadataKey);
