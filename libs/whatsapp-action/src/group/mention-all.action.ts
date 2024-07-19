import { PrismaService } from '@app/prisma/prisma.service';
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

import {
  isJidGroup,
  jidDecode,
  jidNormalizedUser,
} from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSign('tagall'), withSignRegex('tagall .*')],
})
export class MentionAllAction extends WhatsappMessageAction {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  @IsEligible()
  onlyGroup(socket: WASocket, message: WAMessage) {
    return isJidGroup(getJid(message));
  }

  @IsEligible()
  async canMention(socket: WASocket, message: WAMessage) {
    const groupStatus = await this.prisma.groupStatus.findFirst({
      where: {
        jid: jidNormalizedUser(getJid(message)),
      },
    });
    // TODO: jika tidak ada settingan maka set default sebagai hanya saya
    if (!groupStatus?.active) return !!message.key.fromMe;

    const metadata = await LIMITIED_QUEUE.add(() =>
      socket.groupMetadata(getJid(message)),
    );

    const admins = metadata.participants.filter(
      (participant) => !!participant.admin,
    );

    return (
      admins.findIndex(
        (participant) =>
          jidNormalizedUser(participant.id) ===
          jidNormalizedUser(message.key.participant),
      ) > -1
    );
  }

  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);
    const metadata = (await LIMITIED_QUEUE.add(() =>
      socket.groupMetadata(getJid(message)),
    )) as GroupMetadata;
    const quoted = message?.message?.extendedTextMessage?.contextInfo;
    const options: MiscMessageGenerationOptions = {};

    if (quoted?.quotedMessage) {
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
