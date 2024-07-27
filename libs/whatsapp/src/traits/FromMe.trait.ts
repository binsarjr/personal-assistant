import { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';

export class FromMe {
  @IsEligible()
  _fromMe(socket: WASocket, message: WAMessage) {
    return !!message.key.fromMe;
  }
}
