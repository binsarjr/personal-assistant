import {
  downloadMediaMessage,
  jidNormalizedUser,
  type AnyMessageContent,
  type WAMessage,
} from '@whiskeysockets/baileys';
import { Context, OnText, Socket, type SocketClient } from 'baileys-decorators';

export class AntiViewOnceAction {
  @OnText(/.*/)
  async execute(@Socket socket: SocketClient, @Context message: WAMessage) {
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
        await socket.sendMessage(jidNormalizedUser(socket.user!.id), content, {
          quoted: message,
        });
    }
  }
}
