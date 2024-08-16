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
import { WAMessage, WASocket, proto } from '@whiskeysockets/baileys';
import 'moment/locale/id';
import PQueue from 'p-queue';
import {
  injectRandomHiddenText,
  whatsappFormat,
} from 'src/supports/str.support';

let systemInstruction = `
I want you to act as a proofreader. I'm going to give you a text and I want you to check it for any spelling, grammar, or punctuation errors. After you have finished reviewing the text, give me the resulting text that has been refined.


provide it in json format, with the following keys:

{ "type": "object",
  "properties": {
    "result": { "type": "string" },
    "corrections_suggestions": {"type":"string"}
  }
}




`.trim();

systemInstruction = injectRandomHiddenText(systemInstruction);

@WhatsappMessage({
  flags: [withSignRegex('pr .*'), withSign('pr')],
})
export class AiGeminiProofReaderAction extends WhatsappMessageAction {
  private readonly gemini = Gemini.make();
  private readonly queue = new PQueue({ concurrency: 1 });
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

    await this.geminiFunctionService.injectGeminiFunction(this.gemini);
    const response = await this.queue.add(() => this.gemini.generate(true));

    const result: { result: string; corrections_suggestions: string } =
      JSON.parse(response.response.text());

    let text = whatsappFormat(result.result);

    text = text.replace(withSignRegex('pr'), '').trim();

    const realOne = await sendWithTyping(
      socket,
      {
        text,
      },
      message.key.remoteJid,
      {
        quoted: message,
      },
    );

    await sendWithTyping(
      socket,
      {
        text: result.corrections_suggestions,
      },
      message.key.remoteJid,
      {
        quoted: realOne,
      },
    );

    this.reactToDone(socket, message);
  }
}
