import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappGroupAction } from '@app/whatsapp/interfaces/whatsapp.group.interface';
import { withSign } from '@app/whatsapp/supports/flag.support';
import { WAMessage, WASocket, jidDecode } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSign('phoneNumberList')],
})
export class ExtractPhoneNumber extends WhatsappGroupAction {
  @IsEligible()
  async onlyMe(socket: WASocket, message: WAMessage) {
    return !!message.key.fromMe;
  }

  async execute(socket: WASocket, message: WAMessage) {
    const metadata = await socket.groupMetadata(message.key.remoteJid);
    const participants = metadata.participants;
    const phones = participants.map(
      (participant) => jidDecode(participant.id).user,
    );

    await this.reactToProcessing(socket, message);

    await socket.sendMessage(
      socket.user.id,
      {
        text: phones.join('\n'),
      },
      { quoted: message },
    );

    await this.reactToDone(socket, message);
  }
}
