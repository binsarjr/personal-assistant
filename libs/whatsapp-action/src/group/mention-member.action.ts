import { ReadMoreUnicode } from '@app/whatsapp/constants';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getJid } from '@app/whatsapp/supports/message.support';
import { LIMITIED_QUEUE } from '@services/queue';
import type {
  GroupMetadata,
  MiscMessageGenerationOptions,
  WAMessage,
  WASocket,
} from '@whiskeysockets/baileys';
import { isJidGroup, jidDecode } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [
    withSign('tagmem'),
    withSign('tagmember'),
    withSignRegex('tagmem .*'),
    withSignRegex('tagmember .*'),
  ],
})
export class MentionMemberAction extends WhatsappMessageAction {
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
    const metadata = (await LIMITIED_QUEUE.add(() =>
      socket.groupMetadata(getJid(message)),
    )) as GroupMetadata;
    let mentions = metadata.participants
      .filter((participant) => !participant.admin)
      .map((participant) => participant.id);

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
