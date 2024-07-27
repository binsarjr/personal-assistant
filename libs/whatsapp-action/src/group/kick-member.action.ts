import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { withSignRegex } from '@app/whatsapp/supports/flag.support';
import {
  getContextInfo,
  getJid,
  getMessageCaption,
  getMessageQutoedCaption,
} from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { jidEncode, jidNormalizedUser } from '@whiskeysockets/baileys';
import { findPhoneNumbersInText } from 'libphonenumber-js';
import { WhatsappGroupAction } from '@app/whatsapp/interfaces/whatsapp.group.interface';
import { FromMe } from '@app/whatsapp/traits/FromMe.trait';
import { TraitEligible } from '../../../../src/decorators/trait.decorator';

@TraitEligible(FromMe)
@WhatsappMessage({
  flags: [withSignRegex('kick .*'), withSignRegex('rm .*')],
})
export class KickMemberAction extends WhatsappGroupAction {
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
        'remove',
      );
      await this.reactToDone(socket, message);
    } catch (error) {
      await this.reactToFailed(socket, message);
    }
  }
}
