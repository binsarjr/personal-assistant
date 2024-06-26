import { ReadMoreUnicode } from '@app/whatsapp/constants';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getJid } from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { isJidGroup, jidDecode } from '@whiskeysockets/baileys';

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
    let mentions = metadata.participants
      .filter((participant) => !!participant.admin)
      .map((participant) => participant.id);

    // shuffle mentions
    mentions = mentions.sort(() => Math.random() - 0.5);
    const messages = ['PING!!'];

    messages.push(
      `

Jika kamu tertarik membuat whatsapp bot. bisa hubungi saya di:

https://www.linkedin.com/in/binsarjr/
http://github.com/binsarjr/


`.trim(),
    );
    messages.push(
      'cc: ' +
        mentions
          .map((participant) => `@${jidDecode(participant).user}`)
          .join(' '),
    );
    await socket.sendMessage(
      getJid(message),
      {
        text: messages.join(`\n${ReadMoreUnicode}\n`),
        mentions,
      },
      { quoted: message },
    );
    this.reactToDone(socket, message);
  }
}
