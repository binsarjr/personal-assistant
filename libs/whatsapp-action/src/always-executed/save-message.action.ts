import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { PrismaService } from '../../../prisma/src';
import { WhatsappMessageAction } from '../../../whatsapp/src';
import { WhatsappMessage } from '../../../whatsapp/src/decorators/whatsapp-message.decorator';

@WhatsappMessage()
export class SaveMessageAction extends WhatsappMessageAction {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  async execute(socket: WASocket, message: WAMessage) {
    await this.prisma.whatsappMessage.create({
      data: {
        jid: message.key.remoteJid,
        messageId: message.key.id,
        messageTimeUtc: new Date(+message.messageTimestamp * 1000),
        meta: JSON.stringify(message),
      },
    });
  }
}
