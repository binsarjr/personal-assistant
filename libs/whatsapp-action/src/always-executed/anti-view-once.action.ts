import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import {
  downloadMediaMessage,
  jidNormalizedUser,
  type AnyMessageContent,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';

@WhatsappMessage()
export class AntiViewOnceAction extends WhatsappMessageAction {
  @IsEligible()
  notFromMe(socket: WASocket, message: WAMessage) {
    return !message.key.fromMe;
  }

  async execute(socket: WASocket, message: WAMessage) {
    const viewOnceMessage =
      message.message?.viewOnceMessage ||
      message.message?.viewOnceMessageV2 ||
      message.message?.viewOnceMessageV2Extension ||
      message;

    const isViewOnce =
      viewOnceMessage?.message?.imageMessage?.viewOnce ||
      viewOnceMessage?.message?.videoMessage?.viewOnce;

    if (isViewOnce) {
      const image = viewOnceMessage?.message?.imageMessage;
      const video = viewOnceMessage?.message?.videoMessage;
      const caption = image?.caption || video?.caption;

      const media = await downloadMediaMessage(message, 'buffer', {});

      let content: AnyMessageContent | null = null;

      if (image) {
        content = {
          image: media as Buffer,
          caption: caption || undefined,
        };
      } else if (video) {
        content = {
          video: media as Buffer,
          caption: caption || undefined,
        };
      }

      if (content)
        socket.sendMessage(jidNormalizedUser(socket.user.id), content, {
          quoted: message,
        });
    }
  }
}
