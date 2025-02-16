import { Command, Socket } from '$core/decorators';
import { CommandMiddleware } from '$core/decorators/command-middleware';
import { logger } from '$infrastructure/logger/console.logger';
import { IsGroupChatMiddleware } from '$infrastructure/whatsapp/middlewares/is-group-chat.middleware';
import type { SocketClient } from '$infrastructure/whatsapp/types';
import { replaceRandomSpacesToUnicode } from '$support/string.support';
import {
  jidDecode,
  jidNormalizedUser,
  proto,
  type MiscMessageGenerationOptions,
  type WAMessage,
} from '@whiskeysockets/baileys';

export class MentionHandler {
  getRandom(type?: 'all' | 'admin' | 'member') {
    const texts = ['Dicariin tuh', 'Tuh dicariin', 'Di dicariin tuh'];

    if (type == 'admin') {
      texts.push('Oy Admin\ndicariin tuh');
    } else if (type == 'member') {
      texts.push('Oy Member\ndicariin tuh');
    }

    return texts[Math.floor(Math.random() * texts.length)];
  }

  async handler(
    socket: SocketClient,
    message: WAMessage,
    type: 'all' | 'admin' | 'member',
  ) {
    await socket.reactToProcessing();
    const jid = message.key.remoteJid!;

    {
      // admin only

      const jids = await this.participants(socket, jid, 'admin');
      if (!jids.includes(jidNormalizedUser(message.key.participant || jid))) {
        await socket.replyQuoteInPrivate({
          text: 'Maaf saat ini hanya admin saja yang bisa menggunakan perintah ini',
        });
        await socket.reactToFailed();
        return;
      }
    }

    let profilePic: string | undefined = undefined;
    {
      try {
        profilePic = await socket.profilePictureUrl(jid, 'preview');
      } catch (error) {}
    }

    const mentionedJid = await this.participants(socket, jid, type);

    const quoted = message?.message?.extendedTextMessage?.contextInfo;
    const options: MiscMessageGenerationOptions = {};

    if (quoted?.quotedMessage) {
      // @ts-expect-error: quotedMessage is not in type
      quoted['key'] = {
        remoteJid: message.key.remoteJid,
        fromMe: null,
        id: quoted!.stanzaId,
        participant: quoted!.participant,
      };

      // @ts-expect-error: quotedMessage is not in type
      quoted['message'] = quoted.quotedMessage;
      // @ts-expect-error: quotedMessage is not in type
      options['quoted'] = quoted;
    } else {
      options['quoted'] = message;
    }

    await socket.reply(
      {
        text: replaceRandomSpacesToUnicode(
          `PING (${type}) !!!\n\ncc: ` +
            mentionedJid.map((jid) => '@' + jidDecode(jid)?.user).join(' '),
        ),
        mentions: mentionedJid,
        contextInfo: {
          mentionedJid: mentionedJid,
          forwardingScore: 999999,
          isForwarded: true,
          externalAdReply: {
            showAdAttribution: true,
            mediaType: proto.ContextInfo.ExternalAdReplyInfo.MediaType.IMAGE,
            thumbnailUrl: profilePic,
            mediaUrl: '',
            sourceId: jid,
            sourceUrl: '',
            title: 'Muncullah !!!    ',
            body: this.getRandom(type) + '    ',
          },
        },
      },
      options,
    );

    await socket.reactToDone();
  }

  @Command(/^.tagall/)
  @CommandMiddleware(IsGroupChatMiddleware)
  async handlerAll(@Socket() socket: SocketClient, message: WAMessage) {
    await this.handler(socket, message, 'all');
  }

  @Command(/^.tagadmin/)
  @CommandMiddleware(IsGroupChatMiddleware)
  async handlerMentionAdmin(
    @Socket() socket: SocketClient,
    message: WAMessage,
  ) {
    await this.handler(socket, message, 'admin');
  }

  @Command(/^.tagmember/)
  @CommandMiddleware(IsGroupChatMiddleware)
  async handlerMentionMember(
    @Socket() socket: SocketClient,
    message: WAMessage,
  ) {
    await this.handler(socket, message, 'member');
  }

  async participants(
    socket: SocketClient,
    jid: string,
    userType: 'all' | 'admin' | 'member',
  ) {
    const participants = await socket.store.fetchGroupMetadata(jid, socket);

    logger.debug(participants, 'participants');

    if (userType == 'admin') {
      return participants.participants
        .filter((participant) => !!participant.admin)
        .map((participant) => participant.id);
    } else if (userType == 'member') {
      return participants.participants
        .filter((participant) => !participant.admin)
        .map((participant) => participant.id);
    } else {
      return participants.participants.map((participant) => participant.id);
    }
  }
}
