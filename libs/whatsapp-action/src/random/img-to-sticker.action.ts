import type { WAMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import telegraph from '../../../../src/services/telegraph';
import {
  downloadContentBufferFromMessage,
  getJid,
  getMessageCaption,
  WhatsappMessageAction,
  withSign,
  withSignRegex,
} from '../../../whatsapp/src';
import { WhatsappMessage } from '../../../whatsapp/src/decorators/whatsapp-message.decorator';

@WhatsappMessage({
  flags: [withSign('s'), withSignRegex('stic?ker')],
})
export class ImgToStickerAction extends WhatsappMessageAction {
  async execute(socket: any, message: any) {
    console.log(message);
    this.reactToProcessing(socket, message);

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
        this.reactToInvalid(socket, message);
        return;
    }

    if (!photoBuffer) {
      this.reactToInvalid(socket, message);
      return;
    }

    const photo: string | Buffer = await this.processStickerText(
      message,
      photoBuffer,
    );

    const sticker: Sticker = this.prepareSticker(photo);

    await socket.sendMessage(getJid(message), await sticker.toMessage(), {
      quoted: message,
    });
    await this.reactToDone(socket, message);
  }

  protected prepareSticker(photo: string | Buffer): Sticker {
    return new Sticker(photo)
      .setPack('Tukang Koding')
      .setAuthor('Tukang Koding')
      .setType(StickerTypes.FULL);
  }

  protected async processStickerText(
    message: WAMessage,
    defaultPhoto: Buffer,
  ): Promise<string | Buffer> {
    const text: string = getMessageCaption(message.message!);
    const commandArguments = text.match(/\.(.*?) ((.*?)$)/);

    if (!commandArguments) {
      return defaultPhoto;
    }

    if (!commandArguments!.length) {
      return defaultPhoto;
    }

    const [top, bottom] =
      commandArguments[commandArguments.length - 1]!.split('|');
    const imageLink: string = await telegraph(defaultPhoto);

    return (
      'https://api.memegen.link/images/custom/' +
      encodeURIComponent(top ? top.substring(0, 20) : '_') +
      '/' +
      encodeURIComponent(bottom ? bottom.substring(0, 20) : '_') +
      '.png?background=' +
      imageLink
    );
  }
}
