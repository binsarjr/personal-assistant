import {
  getContextInfo,
  getJid,
  getMessageCaption,
  getMessageQutoedCaption,
  IsEligible,
  WhatsappMessage,
  WhatsappMessageAction,
  withSign,
  withSignRegex,
} from '@app/whatsapp';
import {
  isJidGroup,
  jidEncode,
  jidNormalizedUser,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';
import { findPhoneNumbersInText } from 'libphonenumber-js';

@WhatsappMessage({
  flags: [withSignRegex('add .*'), withSign('add')],
})
export class AddMemberAction extends WhatsappMessageAction {
  @IsEligible()
  async onlyGroup(socket: WASocket, message: WAMessage) {
    return isJidGroup(getJid(message));
  }

  @IsEligible()
  async isAdmin(socket: WASocket, message: WAMessage) {
    const metadata = await socket.groupMetadata(getJid(message));

    const me = metadata.participants.find(
      (participant) =>
        jidNormalizedUser(participant.id) ===
        jidNormalizedUser(socket.user?.id),
    );
    if (!me.admin) return false;

    const fromJid = jidNormalizedUser(getJid(message));
    return !!metadata.participants.find(
      (participant) =>
        participant.admin && fromJid === jidNormalizedUser(participant.id),
    );
  }

  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);

    let mentionedJid = getContextInfo(message)?.mentionedJid || [];
    const caption = getMessageCaption(message.message!) || '';
    const quoted = getMessageQutoedCaption(message.message!) || '';
    const phones = findPhoneNumbersInText(caption + ' ' + quoted, 'ID');

    phones.map((phone) => {
      const phoneJid = jidEncode(
        phone.number.number.replace('+', ''),
        's.whatsapp.net',
      );
      if (!mentionedJid.includes(phoneJid)) {
        mentionedJid.push(phoneJid);
      }
    });

    try {
      await socket.groupParticipantsUpdate(
        getJid(message),
        mentionedJid.filter((jid) => jid != jidNormalizedUser(socket.user?.id)),
        'add',
      );
      await this.reactToDone(socket, message);
    } catch (error) {
      await this.reactToFailed(socket, message);
    }
  }
}
