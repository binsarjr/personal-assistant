import { downloadContentBufferFromMessage } from '$support/whatsapp.support';
import type { WAMessage } from '@whiskeysockets/baileys';
import { Context, OnText, Socket, type SocketClient } from 'baileys-decorators';

export class SticketToImage {
  @OnText(['.toimg', '.img'])
  async execute(@Socket socket: SocketClient, @Context message: WAMessage) {
    socket.reactToProcessing();

    let photoBuffer: Buffer | null = null;

    switch (true) {
      case Boolean(
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage
          ?.stickerMessage,
      ):
        {
          const directPath =
            message.message?.extendedTextMessage?.contextInfo?.quotedMessage
              ?.stickerMessage?.directPath;
          const mediaKey =
            message.message?.extendedTextMessage?.contextInfo?.quotedMessage
              ?.stickerMessage?.mediaKey;
          const url =
            message.message?.extendedTextMessage?.contextInfo?.quotedMessage
              ?.stickerMessage?.url;
          photoBuffer = await downloadContentBufferFromMessage(
            {
              directPath,
              mediaKey,
              url,
            },
            'image',
          );
        }
        break;
      case Boolean(message?.message?.stickerMessage):
        {
          const directPath = message?.message?.stickerMessage?.directPath;
          const mediaKey = message?.message?.stickerMessage?.mediaKey;
          const url = message?.message?.stickerMessage?.url;
          photoBuffer = await downloadContentBufferFromMessage(
            {
              directPath,
              mediaKey,
              url,
            },
            'image',
          );
        }
        break;
      default:
        socket.reactToInvalid();
        return;
    }

    if (!photoBuffer) {
      socket.reactToInvalid();
      return;
    }

    await socket.replyWithQuote({
      image: photoBuffer,
    });
    await socket.reactToDone();
  }
}
