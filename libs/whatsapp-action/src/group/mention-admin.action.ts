import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getJid } from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { isJidGroup } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [
    withSign('tagadmin'),
    withSignRegex('tagadmin .*'),
    withSign('admin'),
    withSignRegex('admin .*'),
  ],
})
export class MentionAdminAction extends WhatsappMessageAction {
  @IsEligible()
  async onlyMe(socket: WASocket, message: WAMessage) {
    return !!message.key.fromMe;
  }

  @IsEligible()
  async onlyGroup(socket: WASocket, message: WAMessage) {
    return isJidGroup(getJid(message));
  }

  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);
    const metadata = await socket.groupMetadata(getJid(message));
    await socket.sendMessage(
      getJid(message),
      {
        text: 'PING!!',
        mentions: metadata.participants
          .filter((participant) => !!participant.admin)
          .map((participant) => participant.id),
      },
      { quoted: message },
    );
    this.reactToDone(socket, message);
  }
}
