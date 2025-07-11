import { PREFIX_COMMAND } from '$infrastructure/config/consts.config';
import { logger } from '$infrastructure/logger/console.logger';
import { replaceRandomSpacesToUnicode } from '$support/string.support';
import {
    isJidGroup,
    jidDecode,
    jidNormalizedUser,
    proto,
    type MiscMessageGenerationOptions,
    type WAMessage
} from '@whiskeysockets/baileys';
import { Context, OnText, Socket, type SocketClient } from 'baileys-decorators';

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
        await socket.replyWithQuoteInPrivate({
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

  @OnText(PREFIX_COMMAND + 'tagall')
  async handlerAll(@Socket socket: SocketClient, @Context message: WAMessage) {
    if (!isJidGroup(message.key.remoteJid!)) {
      return;
    }
    await this.handler(socket, message, 'all');
  }

  @OnText(PREFIX_COMMAND + 'tagadmin')
  async handlerMentionAdmin(
    @Socket socket: SocketClient,
    @Context message: WAMessage,
  ) {
    if (!isJidGroup(message.key.remoteJid!)) {
      return;
    }
    await this.handler(socket, message, 'admin');
  }

  @OnText(PREFIX_COMMAND + 'tagmember')
  async handlerMentionMember(
    @Socket socket: SocketClient,
    @Context message: WAMessage,
  ) {
    if (!isJidGroup(message.key.remoteJid!)) {
      return;
    }
    await this.handler(socket, message, 'member');
  }

  async participants(
    socket: SocketClient,
    jid: string,
    userType: 'all' | 'admin' | 'member',
  ) {
    // Placeholder for wa_store.fetchGroupMetadata
    // In a real scenario, this would fetch group participants from a store
    // For now, we'll return a dummy list or throw an error if wa_store is not available
    logger.warn('wa_store.fetchGroupMetadata is not available, returning dummy participants.');
    return ['dummy_user_1', 'dummy_user_2', 'dummy_user_3'];
  }
}
