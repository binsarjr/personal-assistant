import {
  isJidGroup,
  jidEncode,
  jidNormalizedUser,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';
import { findPhoneNumbersInText } from 'libphonenumber-js';
import {
  getContextInfo,
  getJid,
  getMessageCaption,
  getMessageQutoedCaption,
  WhatsappMessageAction,
  withSignRegex,
} from '../../../whatsapp/src';
import { IsEligible } from '../../../whatsapp/src/decorators/is-eligible.decorator';
import { WhatsappMessage } from '../../../whatsapp/src/decorators/whatsapp-message.decorator';

@WhatsappMessage({
  flags: [withSignRegex('kick .*'), withSignRegex('rm .*')],
})
export class KickMemberAction extends WhatsappMessageAction {
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
        'remove',
      );
      await this.reactToDone(socket, message);
    } catch (error) {
      await this.reactToFailed(socket, message);
    }
  }
}
