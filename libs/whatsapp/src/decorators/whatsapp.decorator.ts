import type { Type } from '@nestjs/common';
import { applyClassMetadata } from '../../../../src/supports/decorator.support';
import { WhatsappActionMetadataKey } from '../constants';
import type { WhatsappAction } from '../interfaces/whatsapp.interface';

type WhatsappDecorator = <TFunction extends Type<WhatsappAction>>(
  target: TFunction,
) => void | TFunction;

export const Whatsapp = (): WhatsappDecorator =>
  applyClassMetadata({}, WhatsappActionMetadataKey);
