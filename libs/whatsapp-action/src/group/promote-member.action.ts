import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { withSignRegex } from '@app/whatsapp/supports/flag.support';
import {
  getContextInfo,
  getJid,
  getMessageCaption,
  getMessageQutoedCaption,
} from '@app/whatsapp/supports/message.support';
import { LIMITIED_QUEUE } from '@services/queue';
import type {
  GroupMetadata,
  WAMessage,
  WASocket,
} from '@whiskeysockets/baileys';
import { jidEncode, jidNormalizedUser } from '@whiskeysockets/baileys';
import { findPhoneNumbersInText } from 'libphonenumber-js';
import { WhatsappGroupAction } from '@app/whatsapp/interfaces/whatsapp.group.interface';

@WhatsappMessage({
  flags: [withSignRegex('promote .*')],
})
export class PromoteMemberAction extends WhatsappGroupAction {
  @IsEligible()
  async isAdmin(socket: WASocket, message: WAMessage) {
    const metadata = (await LIMITIED_QUEUE.add(() =>
      socket.groupMetadata(getJid(message)),
    )) as GroupMetadata;

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

    const mentionedJid = getContextInfo(message)?.mentionedJid || [];
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
        'promote',
      );
      await this.reactToDone(socket, message);
    } catch (error) {
      await this.reactToFailed(socket, message);
    }
  }
}
