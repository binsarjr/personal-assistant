import { ReadMoreUnicode } from '$infrastructure/config/consts.config';
import { downloadContentBufferFromMessage } from '$support/whatsapp.support';
import {
    isJidGroup,
    isJidStatusBroadcast,
    jidDecode,
    type BaileysEventMap,
    type MiscMessageGenerationOptions,
    type WAMessage,
} from '@whiskeysockets/baileys';
import {
    Context,
    getContentType,
    getMessageCaption,
    OnEvent,
    Socket,
    type SocketClient,
} from 'baileys-decorators';

export class AntiEditMessageAction {
  @OnEvent('messages.update')
  async execute(
    @Socket socket: SocketClient,
    @Context updates: BaileysEventMap['messages.update'],
  ) {
    for (const { key, update } of updates) {
      if (update.message?.editedMessage) {
        const prevEditedMessage = undefined; // wa_store.getEditedMessage removed
        if (prevEditedMessage) {
          const message = prevEditedMessage;
          console.log(JSON.stringify(message, null, 2), 'FUCKKK');
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
              jidDecode(message.key.participant || message.key.remoteJid!)
                ?.user,
          );

          const formatterDate = new Intl.DateTimeFormat('id', {
            dateStyle: 'full',
            timeStyle: 'long',
          });

          response.push(ReadMoreUnicode);
          response.push(
            'Waktu Dibuat: ' +
              formatterDate.format(
                new Date(
                  // @ts-ignore
                  +(message?.messageTimestamp?.low ||
                    message?.messageTimestamp)! * 1000,
                ),
              ),
          );
          response.push('Waktu DiEdit: ' + formatterDate.format(new Date()));

          const updatedMessages = undefined; // wa_store.messages[jid]?.get(key.id!) removed

          const sended = await this.resolveSendMessage(socket, message, {
            quoted: updatedMessages,
          });
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
  }

  async resolveSendMessage(
    socket: SocketClient,
    message: WAMessage,
    options?: MiscMessageGenerationOptions,
  ): Promise<any> {
    const caption =
      getMessageCaption(message.message!) ||
      message?.message?.editedMessage?.message?.conversation ||
      '';

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
      case 'editedMessage':
      case 'conversation': {
        return await socket.sendMessage(
          socket.user!.id,
          {
            text: caption,
          },
          options,
        );
      }
      case 'imageMessage':
        return await socket.sendMessage(
          socket.user!.id,
          {
            image: await downloadContentBufferFromMessage(
              message.message?.imageMessage!,
              'image',
            ),
            caption: caption,
          },
          options,
        );
      case 'videoMessage':
        return await socket.sendMessage(
          socket.user!.id,
          {
            video: await downloadContentBufferFromMessage(
              message.message?.videoMessage!,
              'video',
            ),
            caption: caption,
          },
          options,
        );
      case 'audioMessage':
        return await socket.sendMessage(
          socket.user!.id,
          {
            audio: await downloadContentBufferFromMessage(
              message.message?.audioMessage!,
              'audio',
            ),
            mimetype: message.message?.audioMessage?.mimetype!,
            caption: caption,
          },
          options,
        );
      case 'documentMessage':
        return await socket.sendMessage(
          socket.user!.id,
          {
            document: await downloadContentBufferFromMessage(
              message.message?.documentMessage!,
              'document',
            ),
            mimetype: message.message?.documentMessage?.mimetype!,
            fileName: message.message?.documentMessage?.fileName!,
            caption: message.message?.documentMessage?.caption || undefined,
          },
          options,
        );
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
