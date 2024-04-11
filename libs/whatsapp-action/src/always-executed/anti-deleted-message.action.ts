import { PrismaService } from '@app/prisma';
import { ReadMoreUnicode } from '@app/whatsapp/constants';
import { IsEligible } from '@app/whatsapp/decorators/is-eligible.decorator';
import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import {
  downloadContentBufferFromMessage,
  getJid,
  getMessageCaption,
} from '@app/whatsapp/supports/message.support';
import {
  getContentType,
  isJidGroup,
  isJidStatusBroadcast,
  jidDecode,
  type WAMessage,
  type WASocket,
} from '@whiskeysockets/baileys';

@WhatsappMessage()
export class AntiDeletedMessageAction extends WhatsappMessageAction {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  @IsEligible()
  notFromMe(socket: WASocket, message: WAMessage) {
    return !message.key.fromMe;
  }

  async execute(socket: WASocket, message: WAMessage) {
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

    const deleted = await this.prisma.whatsappMessage.findFirst({
      where: {
        jid: message.key.remoteJid,
        messageId: protocol.protocolMessage.key.id,
      },
    });
    if (deleted) {
      const message = JSON.parse(deleted.meta) as WAMessage;
      const jid = getJid(message);
      let type = getContentType(message.message!);

      // tidak butuh karena sudah ada fitur anti view once message
      if (
        type === 'viewOnceMessage' ||
        type === 'viewOnceMessageV2' ||
        type === 'viewOnceMessageV2Extension'
      ) {
        return;
      }

      let response = [];

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
          formatterDate.format(new Date(+message.messageTimestamp * 1000)),
      );
      response.push('Waktu Dihapus: ' + formatterDate.format(new Date()));

      const sended = await this.resolveDeletedMessage(socket, message);
      if (sended) {
        await socket.sendMessage(
          socket.user.id,
          {
            text: response.join('\n\n'),
          },
          { quoted: sended },
        );
      }
    }
  }
  async resolveDeletedMessage(socket: WASocket, message: WAMessage) {
    const caption = getMessageCaption(message.message);

    switch (getContentType(message.message)) {
      case 'ephemeralMessage':
        return this.resolveDeletedMessage(
          socket,
          message.message.ephemeralMessage as WAMessage,
        );
      case 'viewOnceMessage':
        return this.resolveDeletedMessage(
          socket,
          message.message.viewOnceMessage as WAMessage,
        );
      case 'viewOnceMessageV2':
        return this.resolveDeletedMessage(
          socket,
          message.message.viewOnceMessageV2 as WAMessage,
        );
      case 'viewOnceMessageV2Extension':
        return this.resolveDeletedMessage(
          socket,
          message.message.viewOnceMessageV2Extension as WAMessage,
        );
      case 'documentWithCaptionMessage':
        return this.resolveDeletedMessage(
          socket,
          message.message.documentWithCaptionMessage as WAMessage,
        );

      case 'extendedTextMessage':
      case 'conversation': {
        return await socket.sendMessage(socket.user.id, {
          text: caption,
        });
      }
      case 'imageMessage':
        return await socket.sendMessage(socket.user.id, {
          image: await downloadContentBufferFromMessage(
            message.message.imageMessage,
            'image',
          ),
          caption: caption,
        });
      case 'videoMessage':
        return await socket.sendMessage(socket.user.id, {
          video: await downloadContentBufferFromMessage(
            message.message.videoMessage,
            'video',
          ),
          caption: caption,
        });
      case 'audioMessage':
        return await socket.sendMessage(socket.user.id, {
          audio: await downloadContentBufferFromMessage(
            message.message.audioMessage,
            'audio',
          ),
          mimetype: message.message.audioMessage.mimetype,
          caption: caption,
        });
      case 'documentMessage':
        return await socket.sendMessage(socket.user.id, {
          document: await downloadContentBufferFromMessage(
            message.message.documentMessage,
            'document',
          ),
          mimetype: message.message.documentMessage.mimetype,
          fileName: message.message.documentMessage.fileName,
          caption: message.message.documentMessage?.caption || undefined,
        });
      case 'stickerMessage':
        return await socket.sendMessage(socket.user.id, {
          sticker: await downloadContentBufferFromMessage(
            message.message.stickerMessage,
            'sticker',
          ),
        });
    }
  }
}
