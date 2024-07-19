import { PrismaService } from '@app/prisma';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign } from '@app/whatsapp/supports/flag.support';
import {
  isJidGroup,
  jidNormalizedUser,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSign('off')],
})
export class TurnOffAction extends WhatsappMessageAction {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  @IsEligible()
  async onlyGroup(socket: WASocket, message: WAMessage) {
    return isJidGroup(message.key.remoteJid);
  }

  async onlyMe(socket: WASocket, message: WAMessage) {
    return !!message.key.fromMe;
  }
  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);
    await this.prisma.groupStatus.upsert({
      where: {
        jid: jidNormalizedUser(message.key.remoteJid || ''),
      },
      update: {
        active: false,
      },
      create: {
        jid: jidNormalizedUser(message.key.remoteJid || ''),
        active: false,
      },
    });
    await socket.sendMessage(message.key.remoteJid, {
      text: 'Grup ini sekarang non-aktif dan tidak bisa menggunakan fitur mention',
    });
    this.reactToDone(socket, message);
  }
}
