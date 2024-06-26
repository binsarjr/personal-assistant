import { PrismaService } from '@app/prisma';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSignRegex } from '@app/whatsapp/supports/flag.support';
import {
  getJid,
  getMessageCaption,
} from '@app/whatsapp/supports/message.support';
import {
  jidNormalizedUser,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSignRegex('story .*')],
})
export class SendStoryAction extends WhatsappMessageAction {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  @IsEligible()
  async onlyMe(socket: any, message: any) {
    return !!message.key.fromMe;
  }

  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);
    const caption = getMessageCaption(message.message!).replace(
      withSignRegex('story\\s+'),
      '',
    );

    const contacts = await this.prisma.whatsappContact.findMany();
    if (contacts.length === 0) {
      await socket.sendMessage(
        getJid(message),
        {
          text: 'Please add at least one contact to send story',
        },
        { quoted: message },
      );
      this.reactToInvalid(socket, message);
      return;
    }

    contacts.push({
      id: jidNormalizedUser(socket.user?.id),
      name: 'Me',
    });

    await socket.sendMessage(
      'status@broadcast',
      {
        text: caption,
      },
      {
        statusJidList: [...new Set(contacts.map((contact) => contact.id))],
      },
    );
    this.reactToDone(socket, message);
  }
}
