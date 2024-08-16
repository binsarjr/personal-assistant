import { GeminiFunctionService } from '@app/gemini-tools/core/gemini-function.service';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign, withSignRegex } from '@app/whatsapp/supports/flag.support';
import {
  downloadContentBufferFromMessage,
  getMessageCaption,
  getMessageFromViewOnce,
  getMessageQutoedCaption,
  sendWithTyping,
} from '@app/whatsapp/supports/message.support';
import { Part } from '@google/generative-ai';
import { Gemini } from '@services/gemini';
import {
  MiscMessageGenerationOptions,
  WAMessage,
  WASocket,
  proto,
} from '@whiskeysockets/baileys';
import 'moment/locale/id';
import PQueue from 'p-queue';
import {
  injectRandomHiddenText,
  whatsappFormat,
} from 'src/supports/str.support';

let systemInstruction = `
Saya ingin Anda bertindak sebagai korektor. Saya akan memberikan Anda teks dan saya ingin Anda memeriksanya untuk mengetahui adanya kesalahan ejaan, tata bahasa, atau tanda baca tanpa menghilangkan format markdown yang diberikan. Setelah Anda selesai meninjau teks, berikan saya hasil teks yang sudah di lakukan penyempurnaan teks. 




provide it in json format, with the JSON schema:

{ "type": "object",
  "properties": {
    "language": { "type": "string" },
    "result": { "type": "string" },
    "corrections_suggestions": {"type":"string"}
  }
}




`.trim();

@WhatsappMessage({
  flags: [withSignRegex('pr .*'), withSign('pr')],
})
export class AiGeminiProofReaderAction extends WhatsappMessageAction {
  private readonly gemini = Gemini.make();
  private readonly queue = new PQueue({ concurrency: 10 });
  constructor(private readonly geminiFunctionService: GeminiFunctionService) {
    super();
    this.gemini.setModel('gemini-1.5-flash-latest');
    this.gemini.setSystemInstruction(systemInstruction);
  }

  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);

    const caption = getMessageCaption(message.message!)
      .replace(withSignRegex('pr'), '')
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
        const text = quotedCaption.replace(withSignRegex('pr'), '').trim();
        parts.push({
          text: injectRandomHiddenText(text),
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
        text: injectRandomHiddenText(caption),
      });

    this.gemini.addContent({
      parts: parts,
      role: 'user',
    });

    const response = await this.queue.add(() => this.gemini.generate(true));

    const result: { result: string; corrections_suggestions: string } =
      JSON.parse(response.response.text());

    let text = whatsappFormat(result.result);

    text = text.replace(withSignRegex('pr'), '').trim();

    const options: MiscMessageGenerationOptions = {};

    if (quoted?.quotedMessage) {
      quoted['key'] = {
        remoteJid: message.key.remoteJid,
        fromMe: null,
        id: quoted!.stanzaId,
        participant: quoted!.participant,
      };

      quoted['message'] = quoted.quotedMessage;
      // @ts-expect-error: quotedMessage is not in type
      options['quoted'] = quoted;
    } else {
      options['quoted'] = message;
    }

    const realOne = await sendWithTyping(
      socket,
      {
        text,
      },
      message.key.remoteJid,
      options,
    );

    await sendWithTyping(
      socket,
      {
        text: whatsappFormat(result.corrections_suggestions),
      },
      message.key.remoteJid,
      {
        quoted: realOne,
      },
    );

    this.reactToDone(socket, message);
  }
}
