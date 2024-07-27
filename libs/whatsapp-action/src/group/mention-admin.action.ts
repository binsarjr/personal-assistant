import { PrismaService } from '@app/prisma';
import { ReadMoreUnicode } from '@app/whatsapp/constants';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getJid } from '@app/whatsapp/supports/message.support';
import { LIMITIED_QUEUE } from '@services/queue';
import type {
  GroupMetadata,
  MiscMessageGenerationOptions,
  WAMessage,
  WASocket,
} from '@whiskeysockets/baileys';
import { jidDecode, jidNormalizedUser } from '@whiskeysockets/baileys';
import { WhatsappGroupAction } from '@app/whatsapp/interfaces/whatsapp.group.interface';

@WhatsappMessage({
  flags: [
    withSign('tagadmin'),
    withSignRegex('tagadmin .*'),
    withSign('admin'),
    withSignRegex('admin .*'),
  ],
})
export class MentionAdminAction extends WhatsappGroupAction {
  constructor(private readonly prisma: PrismaService) {
    super();
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

    return await this.isAdmin(socket, message);
  }

  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);
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

    const metadata = (await LIMITIED_QUEUE.add(() =>
      socket.groupMetadata(getJid(message)),
    )) as GroupMetadata;
    let mentions = metadata.participants
      .filter((participant) => !!participant.admin)
      .map((participant) => participant.id);

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
