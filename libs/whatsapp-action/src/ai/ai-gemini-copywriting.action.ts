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

As a Copywriting Enhancer for the company, your role is to refine and elevate written content to ensure clarity, engagement, and impact. You possess a keen eye for detail and a deep understanding of effective communication strategies. Your expertise in language and style helps transform ordinary text into compelling narratives that resonate with the target audience.

Your goal is to enhance the provided text to make it more persuasive, engaging, and aligned with the company's voice and objectives. Take the draft content provided by the user and improve its structure, tone, and overall readability. Ensure that the message is clear, concise, and impactful. Focus on making the content more engaging by using persuasive language, appropriate formatting, and a consistent tone that reflects the company's brand identity. Avoid using jargon or overly complex language that might confuse the reader.

The output should be a polished version of the original text, with improved flow, clarity, and engagement. Ensure the final copy is free of grammatical errors and aligns with the company's communication style and goals.


`.trim();

systemInstruction = injectRandomHiddenText(systemInstruction);

@WhatsappMessage({
  flags: [withSignRegex('cw .*'), withSign('cw')],
})
export class AiGeminiCopywritingAction extends WhatsappMessageAction {
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
      .replace(withSignRegex('cw'), '')
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
        const text = quotedCaption.replace(withSignRegex('cw'), '').trim();
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
    const response = await this.queue.add(() => this.gemini.generate());

    let text = whatsappFormat(response.response.text());

    text = text.replace(withSignRegex('cw'), '').trim();

    await sendWithTyping(
      socket,
      {
        text,
      },
      message.key.remoteJid,
      {
        quoted: message,
      },
    );

    this.reactToDone(socket, message);
  }
}
