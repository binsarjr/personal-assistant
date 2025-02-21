import { PREFIX_COMMAND } from '$infrastructure/config/consts.config';
import {
  downloadContentBufferFromMessage,
  getMessageQutoedCaption,
} from '$support/whatsapp.support';
import {
  FunctionCallingMode,
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  SchemaType,
  type Content,
  type GenerateContentCandidate,
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

enum FunctionCallingName {
  NULIS = 'nulis',
}

export class GeminiHandler {
  systemInstruction = `
Jawab dengan singkat dengan gaya bahasa gaul indonesia, namamu sendiri adalah Nierma.
Supaya lebih natural gunakanlah gaya bahasa alami manusia.

Use this when value is true:
emoji: ${Math.random() > 0.5}

FunctionCallingTool:
- use without ask question

  `.trim();

  socket: SocketClient | undefined;

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
    this.socket = socket;
    const response = await this.model().generateContent({
      contents: await this.resolveUserRequest(socket, msg),
    });

    const responseText = response.response.text().trim();
    if (responseText.length > 0) {
      socket.replyWithQuote({
        text: responseText,
      });
    }

    await this.resolveCondidatesFunction(response.response.candidates || []);
  }

  async nulis(
    args: { text: string } & Partial<{
      name: string;
      date: string;
      subject: string;
      class: string;
    }>,
  ) {
    const url = new URL('https://fastrestapis.fasturl.cloud/tool/texttonote?');
    url.searchParams.append('format', 'png');
    url.searchParams.append('content', args.text);
    url.searchParams.append('name', args?.name || ' ');
    url.searchParams.append('date', args?.date || ' ');
    url.searchParams.append('subject', args?.subject || ' ');
    url.searchParams.append('classroom', args?.class || ' ');
    url.searchParams.append('font', 'MyHandsareHoldingYou.ttf');
    await this.socket?.replyWithQuote({
      image: {
        url: url.toString(),
      },
    });
  }

  async resolveCondidatesFunction(candidates: GenerateContentCandidate[] = []) {
    for (const candidate of candidates || []) {
      for (const part of candidate.content.parts) {
        if (part.functionCall) {
          // @ts-ignore
          await this[part.functionCall.name](part.functionCall.args);
        }
      }
    }
  }

  async resolveUserRequest(socket: SocketClient, msg: WAMessage) {
    const caption = getMessageCaption(msg.message!)
      .replace(/^.ai\s+/, '')
      .trim();
    const contents = await this.resolveContents(socket, msg);

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

    return contents;
  }

  async resolveContents(socket: SocketClient, msg: WAMessage) {
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
    return contents;
  }

  model() {
    const apiKeys = (Bun.env.GEMINI_API_KEY || '').split(',');
    const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    const gemini = new GoogleGenerativeAI(apiKey);

    const model = gemini.getGenerativeModel({
      // model: 'gemini-2.0-flash-exp',
      model: 'gemini-2.0-flash',
      // model: 'gemini-2.0-flash-lite-preview-02-05',
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
      tools: [
        {
          functionDeclarations: [
            {
              name: FunctionCallingName.NULIS,
              description: 'untuk menulis di kertas',
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  name: {
                    type: SchemaType.STRING,
                  },
                  text: {
                    type: SchemaType.STRING,
                  },
                  date: {
                    type: SchemaType.STRING,
                  },
                  subject: {
                    type: SchemaType.STRING,
                  },
                  class: {
                    type: SchemaType.STRING,
                  },
                },
                required: ['text'],
              },
            },
          ],
        },
      ],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },

      // generationConfig: {
      //   temperature: 1,
      //   topP: 0.95,
      //   topK: 64,
      // },
    });

    return model;
  }
}
