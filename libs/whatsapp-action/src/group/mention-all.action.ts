import { ReadMoreUnicode } from '@app/whatsapp/constants';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getJid } from '@app/whatsapp/supports/message.support';
import type {
  MiscMessageGenerationOptions,
  WAMessage,
  WASocket,
} from '@whiskeysockets/baileys';

import { isJidGroup, jidDecode } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSign('tagall'), withSignRegex('tagall .*')],
})
export class MentionAllAction extends WhatsappMessageAction {
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
    const quoted = message?.message?.extendedTextMessage?.contextInfo;
    const options: MiscMessageGenerationOptions = {};

    if (quoted) {
      quoted['key'] = {
        remoteJid: message.key.remoteJid,
        fromMe: null,
        id: quoted!.stanzaId,
        participant: quoted!.participant,
      };

      quoted['message'] = quoted.quotedMessage;
      // @ts-expect-error: quotedMessage is not in type
      options['quoted'] = quoted;
    } else {
      options['quoted'] = message;
    }

    let mentions = metadata.participants.map((participant) => participant.id);
    // shuffle mentions
    mentions = mentions.sort(() => Math.random() - 0.5);

    const messages = ['PING!!'];

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
      options,
    );
    this.reactToDone(socket, message);
  }
}
