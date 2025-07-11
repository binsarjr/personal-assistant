import { ReadMoreUnicode } from '$infrastructure/config/consts.config';
import {
    downloadContentBufferFromMessage,
    getMessageCaption,
} from '$support/whatsapp.support';
import {
    getContentType,
    isJidGroup,
    isJidStatusBroadcast,
    jidDecode,
    proto,
    type BaileysEventMap,
    type WAMessage
} from '@whiskeysockets/baileys';
import {
    Context,
    OnEvent,
    Socket,
    type SocketClient,
} from 'baileys-decorators';

export class AntiDeletedMessageHandler {
  @OnEvent('messages.update')
  async execute(
    @Socket socket: SocketClient,
    @Context updates: BaileysEventMap['messages.update'],
  ) {
    for (const { update, key } of updates) {
      if (key.fromMe) {
        continue;
      }

      if (update.messageStubType != proto.WebMessageInfo.StubType.REVOKE) {
        continue;
      }

      const deleted = undefined; // wa_store.getDeletedMessage removed
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
          continue;
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

        const sended = await this.resolveSendMessage(socket, message);
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
  }

  async resolveSendMessage(
    socket: SocketClient,
    message: WAMessage,
  ): Promise<any> {
    const caption = getMessageCaption(message.message!);

    switch (getContentType(message.message!)) {
      case 'ephemeralMessage':
        return this.resolveSendMessage(
          socket,
          message.message?.ephemeralMessage as WAMessage,
        );
      case 'viewOnceMessage':
        return this.resolveSendMessage(
          socket,
          message.message?.viewOnceMessage as WAMessage,
        );
      case 'viewOnceMessageV2':
        return this.resolveSendMessage(
          socket,
          message.message?.viewOnceMessageV2 as WAMessage,
        );
      case 'viewOnceMessageV2Extension':
        return this.resolveSendMessage(
          socket,
          message.message?.viewOnceMessageV2Extension as WAMessage,
        );
      case 'documentWithCaptionMessage':
        return this.resolveSendMessage(
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
