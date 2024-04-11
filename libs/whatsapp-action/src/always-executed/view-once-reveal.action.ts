import {
  downloadMediaMessage,
  jidNormalizedUser,
  type AnyMessageContent,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';
import { WhatsappMessageAction } from '../../../whatsapp/src';
import { IsEligible } from '../../../whatsapp/src/decorators/is-eligible.decorator';
import { WhatsappMessage } from '../../../whatsapp/src/decorators/whatsapp-message.decorator';

@WhatsappMessage()
export class ViewOnceAutoRevealAction extends WhatsappMessageAction {
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
