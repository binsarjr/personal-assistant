import { Context } from '$baileys-decorators/decorators/event-body.decorator';
import { OnEvent } from '$baileys-decorators/decorators/on-event.decorator';
import { OnText } from '$baileys-decorators/decorators/on-text.decorator';

import { Socket as Socket2 } from '$baileys-decorators/decorators/socket.decorator';
import { Command, Socket } from '$core/decorators';
import type { SocketClient } from '$infrastructure/whatsapp/types';
import makeWASocket, {
  downloadMediaMessage,
  jidNormalizedUser,
  type AnyMessageContent,
  type BaileysEventMap,
  type WAMessage,
} from '@whiskeysockets/baileys';

export class AntiViewOnceAction {
  @Command(/.*/)
  async execute(@Socket() socket: SocketClient, message: WAMessage) {
    const viewOnceMessage =
      message.message?.viewOnceMessage ||
      message.message?.viewOnceMessageV2 ||
      message.message?.viewOnceMessageV2Extension ||
      message;

    const isViewOnce =
      viewOnceMessage?.message?.imageMessage?.viewOnce ||
      viewOnceMessage?.message?.videoMessage?.viewOnce;

    if (isViewOnce) {
      const image = viewOnceMessage?.message?.imageMessage;
      const video = viewOnceMessage?.message?.videoMessage;
      const caption = image?.caption || video?.caption;

      const media = await downloadMediaMessage(message, 'buffer', {});

      let content: AnyMessageContent | null = null;

      if (image) {
        content = {
          image: media as Buffer,
          caption: caption || undefined,
        };
      } else if (video) {
        content = {
          video: media as Buffer,
          caption: caption || undefined,
        };
      }

      if (content)
        await socket.sendMessage(jidNormalizedUser(socket.user!.id), content, {
          quoted: message,
        });
    }
  }

  // @OnEvent('messages.upsert')
  // async onEvent(event: any) {
  //   console.log('coab coba');
  // }

  @OnEvent('messages.upsert')
  async wkwkkw(
    @Socket2 socket: ReturnType<typeof makeWASocket>,
    @Context event: BaileysEventMap['messages.upsert'],
  ) {
    event;
  }

  @OnText(/helLo/)
  async onText(
    @Socket2 socket: ReturnType<typeof makeWASocket>,
    @Context ctx: WAMessage,
  ) {
    await socket.sendMessage(ctx.key.remoteJid!, { text: 'apa kabs' });
  }
}
