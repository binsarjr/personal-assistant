import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSignRegex } from '@app/whatsapp/supports/flag.support';
import {
  downloadContentBufferFromMessage,
  getMessageCaption,
  getMessageFromViewOnce,
  getMessageQutoedCaption,
  sendWithTyping,
} from '@app/whatsapp/supports/message.support';
import { Part } from '@google/generative-ai';
import { Gemini } from '@services/gemini';
import { WAMessage, WASocket, proto } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSignRegex('ai .*')],
})
export class AiChatgptAction extends WhatsappMessageAction {
  private readonly gemini = Gemini.make();
  constructor() {
    super();
    this.gemini.setModel('gemini-1.5-flash');
    this.gemini.setSystemInstruction(
      `
You're Binsar's AI Assistant.
with given prompts below please answer it with language as natural as humanly possible and more casual.If the text below ask you about your owner,trainer developer, just answer with describe me with my name which is Binsar that I'am programmer, handsome, kind and born in Belitung.
answer with use text below language, don't use english for each text. Please to not assume always Binsar is give you the text below, it came from other people as well. Above is the rules or basic knowledge before you executing the prompts everything that listed in below is the actual prompts


`.trim(),
    );
  }

  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);

    const caption = getMessageCaption(message.message!)
      .replace(withSignRegex('ai'), '')
      .trim();

    const parts: Part[] = [];

    const quoted = message?.message?.extendedTextMessage?.contextInfo;
    if (quoted?.quotedMessage) {
      const quotedMessage = quoted.quotedMessage;
      const quotedViewOnce = getMessageFromViewOnce(
        quotedMessage as proto.IWebMessageInfo,
      );
      const quotedImage =
        quotedViewOnce?.imageMessage || quotedMessage?.imageMessage;
      if (quotedImage) {
        const media = (await downloadContentBufferFromMessage(
          {
            directPath: quotedImage.directPath,
            mediaKey: quotedImage.mediaKey,
            url: quotedImage.url,
          },
          'image',
        )) as Buffer;
        parts.push({
          inlineData: {
            data: Buffer.from(media).toString('base64'),
            mimeType: 'image/jpeg',
          },
        });
      }

      const quotedCaption = getMessageQutoedCaption(message.message!);
      if (quotedCaption) {
        parts.push({
          text: quotedCaption.replace(withSignRegex('ai'), '').trim(),
        });
      }
    }

    const viewOnce = getMessageFromViewOnce(message);
    const image = viewOnce?.imageMessage || message?.message?.imageMessage;
    const anyImage = !!image;
    if (anyImage) {
      const media = (await downloadContentBufferFromMessage(
        {
          directPath: image.directPath,
          mediaKey: image.mediaKey,
          url: image.url,
        },
        'image',
      )) as Buffer;
      parts.push({
        inlineData: {
          data: Buffer.from(media).toString('base64'),
          mimeType: 'image/jpeg',
        },
      });
    }

    if (caption)
      parts.push({
        text: caption,
      });

    this.gemini.addContent({
      parts: parts,
      role: 'user',
    });
    const response = await this.gemini.generate();

    await sendWithTyping(
      socket,
      {
        text: response.response.text(),
      },
      message.key.remoteJid,
      {
        quoted: message,
      },
    );

    this.reactToDone(socket, message);
  }
}
