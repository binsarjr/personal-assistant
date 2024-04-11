import { WhatsappActionMetadataKey } from '@app/whatsapp/constants';
import type { WhatsappAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import type { Type } from '@nestjs/common';
import { applyClassMetadata } from 'src/supports/decorator.support';

type WhatsappDecorator = <TFunction extends Type<WhatsappAction>>(
  target: TFunction,
) => void | TFunction;

export const Whatsapp = (): WhatsappDecorator =>
  applyClassMetadata({}, WhatsappActionMetadataKey);
