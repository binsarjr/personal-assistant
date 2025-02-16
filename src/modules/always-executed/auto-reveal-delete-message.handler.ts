import { ReadMoreUnicode } from '$infrastructure/config/consts.config';
import { logger } from '$infrastructure/logger/console.logger';
import wa_store from '$infrastructure/whatsapp/whatsapp-store';
import {
  downloadContentBufferFromMessage,
  getMessageCaption,
} from '$support/whatsapp.support';
import {
  getContentType,
  isJidGroup,
  isJidStatusBroadcast,
  jidDecode,
  jidNormalizedUser,
  type WAMessage,
} from '@whiskeysockets/baileys';
import { Context, OnText, Socket, type SocketClient } from 'baileys-decorators';

export class AntiDeletedMessageHandler {
  @OnText(/.*/)
  async execute(@Socket socket: SocketClient, @Context message: WAMessage) {
    if (message.key.fromMe) {
      return;
    }
    if (!message.message) {
      logger.info('message.message is null from AntiDeletedMessageAction');
      return;
    }
    const protocol = JSON.parse(JSON.stringify(message.message)) as {
      protocolMessage: {
        key: {
          remoteJid: string;
          fromMe: boolean;
          id: string;
        };
        type: 'REVOKE';
      };
    };

    if (protocol?.protocolMessage?.type !== 'REVOKE') {
      return;
    }

    const deleted = wa_store.getDeletedMessage(
      jidNormalizedUser(message.key.remoteJid!),
      message.message?.protocolMessage?.key?.id!,
    );
    if (deleted) {
      const message = deleted;
      const jid = message.key.remoteJid!;
      const type = getContentType(message.message!);

      // tidak butuh karena sudah ada fitur anti view once message
      if (
        type === 'viewOnceMessage' ||
        type === 'viewOnceMessageV2' ||
        type === 'viewOnceMessageV2Extension'
      ) {
        return;
      }

      const response = [];

      if (isJidStatusBroadcast(jid)) {
        response.push('Story Whatsapp');
      } else if (isJidGroup(jid)) {
        const metadata = await socket.groupMetadata(jid);
        response.push('Grup: *' + metadata.subject + '*');
      }

      response.push(
        'User *' + (message?.verifiedBizName || message?.pushName) + '*',
      );

      response.push(
        'NoHP: ' +
          jidDecode(message.key.participant || message.key.remoteJid!)?.user,
      );

      const formatterDate = new Intl.DateTimeFormat('id', {
        dateStyle: 'full',
        timeStyle: 'long',
      });

      response.push(ReadMoreUnicode);
      response.push(
        'Waktu Dibuat: ' +
          formatterDate.format(new Date(+message.messageTimestamp! * 1000)),
      );
      response.push('Waktu Dihapus: ' + formatterDate.format(new Date()));

      const sended = await this.resolveDeletedMessage(socket, message);
      if (sended) {
        await socket.sendMessage(
          socket.user!.id,
          {
            text: response.join('\n\n'),
          },
          { quoted: sended },
        );
      }
    }
  }
  async resolveDeletedMessage(
    socket: SocketClient,
    message: WAMessage,
  ): Promise<any> {
    const caption = getMessageCaption(message.message!);

    switch (getContentType(message.message!)) {
      case 'ephemeralMessage':
        return this.resolveDeletedMessage(
          socket,
          message.message?.ephemeralMessage as WAMessage,
        );
      case 'viewOnceMessage':
        return this.resolveDeletedMessage(
          socket,
          message.message?.viewOnceMessage as WAMessage,
        );
      case 'viewOnceMessageV2':
        return this.resolveDeletedMessage(
          socket,
          message.message?.viewOnceMessageV2 as WAMessage,
        );
      case 'viewOnceMessageV2Extension':
        return this.resolveDeletedMessage(
          socket,
          message.message?.viewOnceMessageV2Extension as WAMessage,
        );
      case 'documentWithCaptionMessage':
        return this.resolveDeletedMessage(
          socket,
          message.message?.documentWithCaptionMessage as WAMessage,
        );

      case 'extendedTextMessage':
      case 'conversation': {
        return await socket.sendMessage(socket.user!.id, {
          text: caption,
        });
      }
      case 'imageMessage':
        return await socket.sendMessage(socket.user!.id, {
          image: await downloadContentBufferFromMessage(
            message.message?.imageMessage!,
            'image',
          ),
          caption: caption,
        });
      case 'videoMessage':
        return await socket.sendMessage(socket.user!.id, {
          video: await downloadContentBufferFromMessage(
            message.message?.videoMessage!,
            'video',
          ),
          caption: caption,
        });
      case 'audioMessage':
        return await socket.sendMessage(socket.user!.id, {
          audio: await downloadContentBufferFromMessage(
            message.message?.audioMessage!,
            'audio',
          ),
          mimetype: message.message?.audioMessage?.mimetype!,
          caption: caption,
        });
      case 'documentMessage':
        return await socket.sendMessage(socket.user!.id, {
          document: await downloadContentBufferFromMessage(
            message.message?.documentMessage!,
            'document',
          ),
          mimetype: message.message?.documentMessage?.mimetype!,
          fileName: message.message?.documentMessage?.fileName!,
          caption: message.message?.documentMessage?.caption || undefined,
        });
      // case 'stickerMessage':
      //   return await socket.sendMessage(socket.user.id, {
      //     sticker: await downloadContentBufferFromMessage(
      //       message.message.stickerMessage,
      //       'sticker',
      //     ),
      //   });
    }
  }
}
