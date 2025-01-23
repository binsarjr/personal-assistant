import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign } from '@app/whatsapp/supports/flag.support';
import { downloadContentBufferFromMessage } from '@app/whatsapp/supports/message.support';
import {
  type AnyMessageContent,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSign('view')],
})
export class ViewAction extends WhatsappMessageAction {
  @IsEligible()
  onlyMe(socket: WASocket, message: WAMessage) {
    return !!message.key.fromMe;
  }

  @IsEligible()
  mustHaveQuoted(socket: WASocket, message: WAMessage) {
    return !!message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  }

  @IsEligible()
  haveViewOnce(socket: WASocket, message: WAMessage) {
    const quoted =
      message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    return (
      quoted?.viewOnceMessage ||
      quoted?.viewOnceMessageV2 ||
      quoted?.viewOnceMessageV2Extension
    );
  }
  async execute(socket: WASocket, message: WAMessage): Promise<void> {
    const quotedMessage =
      message.message?.extendedTextMessage?.contextInfo.quotedMessage;
    const viewOnceMessage =
      quotedMessage?.viewOnceMessage ||
      quotedMessage?.viewOnceMessageV2 ||
      quotedMessage?.viewOnceMessageV2Extension;

    const isViewOnce =
      viewOnceMessage?.message?.imageMessage?.viewOnce ||
      viewOnceMessage?.message?.videoMessage?.viewOnce;

    if (isViewOnce) {
      const image = viewOnceMessage?.message?.imageMessage;
      const video = viewOnceMessage?.message?.videoMessage;
      const caption = image?.caption || video?.caption;

      const media = await downloadContentBufferFromMessage(
        image || video,
        image ? 'image' : 'video',
      );

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

      const quoted = message?.message?.extendedTextMessage?.contextInfo;
      if (content)
        await socket.sendMessage(message.key.remoteJid, content, {
          quoted: {
            ...quoted,
            key: {
              remoteJid: message.key.remoteJid,
              fromMe: null,
              id: quoted!.stanzaId,
              participant: quoted!.participant!,
            },
            message: quoted.quotedMessage,
          },
        });
    }
  }
}
