import { Command, Socket } from '$core/decorators';
import { downloadContentBufferFromMessage } from '$support/whatsapp.support';
import {
  jidNormalizedUser,
  type AnyMessageContent,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';

export class AutoRevealViewOnceWhenQuotedAction {
  @Command(/.*/)
  async execute(@Socket() socket: WASocket, message: WAMessage): Promise<void> {
    if (!message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      return;
    }

    const quotedMessage =
      message.message?.extendedTextMessage?.contextInfo.quotedMessage;
    const viewOnceMessage = quotedMessage?.viewOnceMessage ||
      quotedMessage?.viewOnceMessageV2 ||
      quotedMessage?.viewOnceMessageV2Extension || { message: quotedMessage };

    const isViewOnce =
      viewOnceMessage?.message?.imageMessage?.viewOnce ||
      viewOnceMessage?.message?.videoMessage?.viewOnce;

    if (isViewOnce) {
      const image = viewOnceMessage?.message?.imageMessage;
      const video = viewOnceMessage?.message?.videoMessage;
      const caption = image?.caption || video?.caption;

      const media = await downloadContentBufferFromMessage(
        image || video!,
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
        await socket.sendMessage(jidNormalizedUser(socket.user!.id), content, {
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
