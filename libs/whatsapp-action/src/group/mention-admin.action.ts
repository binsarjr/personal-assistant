import {
  isJidGroup,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';
import {
  getJid,
  WhatsappMessageAction,
  withSign,
  withSignRegex,
} from '../../../whatsapp/src';
import { IsEligible } from '../../../whatsapp/src/decorators/is-eligible.decorator';
import { WhatsappMessage } from '../../../whatsapp/src/decorators/whatsapp-message.decorator';

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
