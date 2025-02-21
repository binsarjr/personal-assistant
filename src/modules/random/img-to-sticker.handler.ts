import { PREFIX_COMMAND } from '$infrastructure/config/consts.config';
import { downloadContentBufferFromMessage } from '$support/whatsapp.support';
import { jidNormalizedUser, type WAMessage } from '@whiskeysockets/baileys';
import {
  Context,
  createGuard,
  OnText,
  Socket,
  type SocketClient,
} from 'baileys-decorators';
import Sticker, { StickerTypes } from 'wa-sticker-formatter';

export class ImgToStickerHandler {
  @OnText(
    [
      PREFIX_COMMAND + 's',
      PREFIX_COMMAND + 'sticker',
      PREFIX_COMMAND + 'stiker',
    ],
    {
      guard: [
        createGuard((socket, message) => {
          return (
            jidNormalizedUser(socket.user!.id) !==
            jidNormalizedUser(message.key.remoteJid!)
          );
        }),
      ],
    },
  )
  async execute(@Socket socket: SocketClient, @Context message: WAMessage) {
    socket.reactToProcessing();

    let photoBuffer: Buffer | null = null;

    switch (true) {
      case Boolean(
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage
          ?.imageMessage,
      ):
        {
          const directPath =
            message.message?.extendedTextMessage?.contextInfo?.quotedMessage
              ?.imageMessage?.directPath;
          const mediaKey =
            message.message?.extendedTextMessage?.contextInfo?.quotedMessage
              ?.imageMessage?.mediaKey;
          const url =
            message.message?.extendedTextMessage?.contextInfo?.quotedMessage
              ?.imageMessage?.url;
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
      case Boolean(message?.message?.imageMessage):
        {
          const directPath = message?.message?.imageMessage?.directPath;
          const mediaKey = message?.message?.imageMessage?.mediaKey;
          const url = message?.message?.imageMessage?.url;
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

    const sticker: Sticker = this.prepareSticker(photoBuffer);

    await socket.replyWithQuote(await sticker.toMessage());
    await socket.reactToDone();
  }

  protected prepareSticker(photo: string | Buffer): Sticker {
    return new Sticker(photo)
      .setPack('Tukang Koding')
      .setAuthor('Tukang Koding')
      .setType(StickerTypes.FULL);
  }
}
