import { PREFIX_COMMAND } from '$infrastructure/config/consts.config';
import {
  downloadContentBufferFromMessage,
  getMessageQutoedCaption,
} from '$support/whatsapp.support';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  type Content,
  type Part,
} from '@google/generative-ai';
import { jidNormalizedUser, type WAMessage } from '@whiskeysockets/baileys';
import {
  Context,
  createGuard,
  getMessageCaption,
  OnText,
  Socket,
  type SocketClient,
} from 'baileys-decorators';

export class GeminiHandler {
  systemInstruction = `
Jawab dengan singkat dengan gaya bahasa gaul indonesia, namamu sendiri adalah Nierma.
Supaya lebih natural gunakanlah gaya bahasa alami manusia.

Use this when value is true:
emoji: ${Math.random() > 0.5}
  `.trim();

  @OnText(PREFIX_COMMAND + 'ai', {
    matchType: 'startsWith',
    guard: [
      createGuard((socket, msg) => {
        if (!Bun.env.GEMINI_API_KEY) {
          socket.replyWithQuote({
            text: 'waduh developernya lupa setting api key sehingga fitur ini blm bisa digunakan',
          });
        }
        return !!Bun.env.GEMINI_API_KEY;
      }),
    ],
  })
  async gemini(@Socket socket: SocketClient, @Context msg: WAMessage) {
    const caption = getMessageCaption(msg.message!)
      .replace(/^.ai\s+/, '')
      .trim();

    const contents: Content[] = [];
    const quoted = msg?.message?.extendedTextMessage?.contextInfo;

    if (quoted?.quotedMessage) {
      const quotedJid =
        msg!.message!.extendedTextMessage!.contextInfo!.remoteJid!;
      const isMe =
        jidNormalizedUser(quotedJid) === jidNormalizedUser(socket.user?.id);
      const quotedMessage = quoted.quotedMessage;
      const quotedImage = quotedMessage?.imageMessage;
      if (quotedImage) {
        const media = (await downloadContentBufferFromMessage(
          {
            directPath: quotedImage.directPath,
            mediaKey: quotedImage.mediaKey,
            url: quotedImage.url,
          },
          'image',
        )) as Buffer;
        if (isMe) {
          contents.push({
            parts: [
              {
                inlineData: {
                  data: Buffer.from(media).toString('base64'),
                  mimeType: 'image/jpeg',
                },
              },
            ],
            role: 'assistant',
          });
        } else {
          contents.push({
            parts: [
              {
                inlineData: {
                  data: Buffer.from(media).toString('base64'),
                  mimeType: 'image/jpeg',
                },
              },
            ],
            role: 'user',
          });
        }
      }

      const quotedCaption = getMessageQutoedCaption(msg.message!);
      if (quotedCaption) {
        const text = quotedCaption.replace(/^.ai/, '').replace(/^$/, '').trim();
        if (isMe) {
          contents.push({
            parts: [
              {
                text: text,
              },
            ],
            role: 'assistant',
          });
        } else {
          contents.push({
            parts: [
              {
                text: text,
              },
            ],
            role: 'user',
          });
        }
      }
    }

    const image = msg?.message?.imageMessage;
    const anyImage = !!image;

    const lastPart: Part[] = [];
    if (anyImage) {
      const media = (await downloadContentBufferFromMessage(
        {
          directPath: image.directPath,
          mediaKey: image.mediaKey,
          url: image.url,
        },
        'image',
      )) as Buffer;
      lastPart.push({
        inlineData: {
          data: Buffer.from(media).toString('base64'),
          mimeType: 'image/jpeg',
        },
      });
    }

    if (caption)
      lastPart.push({
        text: caption,
      });

    contents.push({
      role: 'user',
      parts: lastPart,
    });

    const resptext = await this.model().generateContent({
      contents,
    });

    socket.replyWithQuote({
      text: await resptext.response.text().trim(),
    });
  }

  model() {
    const apiKeys = (Bun.env.GEMINI_API_KEY || '').split(',');
    const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    const gemini = new GoogleGenerativeAI(apiKey);

    const model = gemini.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: this.systemInstruction,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      // generationConfig: {
      //   temperature: 1,
      //   topP: 0.95,
      //   topK: 64,
      // },
    });

    return model;
  }
}
