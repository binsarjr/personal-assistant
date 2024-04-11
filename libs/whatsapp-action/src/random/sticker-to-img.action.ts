import {
  downloadContentBufferFromMessage,
  getJid,
  WhatsappMessage,
  WhatsappMessageAction,
  withSign,
} from '@app/whatsapp';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSign('toimg'), withSign('img')],
})
export class StickerToImgAction extends WhatsappMessageAction {
  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);

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
        this.reactToInvalid(socket, message);
        return;
    }

    if (!photoBuffer) {
      this.reactToInvalid(socket, message);
      return;
    }

    await socket.sendMessage(
      getJid(message),
      {
        image: photoBuffer,
      },
      {
        quoted: message,
      },
    );
    await this.reactToDone(socket, message);
  }
}
