import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { isJidGroup, WAMessage, WASocket } from '@whiskeysockets/baileys';
import { getJid } from '@app/whatsapp/supports/message.support';

export class IsGroup {
  @IsEligible()
  async _isGroup(socket: WASocket, message: WAMessage) {
    return isJidGroup(getJid(message));
  }
}
