import { PrismaService } from '@app/prisma'
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator'
import { WhatsappGroupAction } from '@app/whatsapp/interfaces/whatsapp.group.interface'
import { withSign } from '@app/whatsapp/supports/flag.support'
import { FromMe } from '@app/whatsapp/traits/FromMe.trait'
import { TraitEligible } from '@src/decorators/trait.decorator'
import {
  jidNormalizedUser,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys'

@TraitEligible(FromMe)
@WhatsappMessage({
  flags: [withSign('off')],
})
export class TurnOffAction extends WhatsappGroupAction {
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
