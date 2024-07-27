import { PrismaService } from '@app/prisma';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { withSign } from '@app/whatsapp/supports/flag.support';
import {
  jidNormalizedUser,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';
import { WhatsappGroupAction } from '@app/whatsapp/interfaces/whatsapp.group.interface';
import { FromMe } from '@app/whatsapp/traits/FromMe.trait';
import { TraitEligible } from '../../../../src/decorators/trait.decorator';

@TraitEligible(FromMe)
@WhatsappMessage({
  flags: [withSign('on')],
})
export class TurnOnAction extends WhatsappGroupAction {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);
    await this.prisma.groupStatus.upsert({
      where: {
        jid: jidNormalizedUser(message.key.remoteJid || ''),
      },
      update: {
        active: true,
      },
      create: {
        jid: jidNormalizedUser(message.key.remoteJid || ''),
        active: true,
      },
    });
    await socket.sendMessage(message.key.remoteJid, {
      text: 'Grup ini sekarang aktif dan bisa menggunakan fitur mention (ADMIN ONLY)',
    });
    this.reactToDone(socket, message);
  }
}
