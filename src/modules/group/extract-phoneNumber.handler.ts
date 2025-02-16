import { Command, Socket } from '$core/decorators';
import { CommandMiddleware } from '$core/decorators/command-middleware';
import { IsOnlyMeMiddleware } from '$infrastructure/whatsapp/middlewares/is-me.middleware';
import type { SocketClient } from '$infrastructure/whatsapp/types';
import { type WAMessage, jidDecode } from '@whiskeysockets/baileys';

export class ExtractPhoneNumberHandler {
  @Command(/^.phones$/i)
  @CommandMiddleware(IsOnlyMeMiddleware)
  async execute(@Socket() socket: SocketClient, message: WAMessage) {
    const metadata = await socket.store.fetchGroupMetadata(
      message.key.remoteJid!,
      socket,
    );
    const participants = metadata.participants;
    const phones = participants
      .map((participant) => jidDecode(participant.id)?.user)
      .filter(Boolean);

    await socket.reactToProcessing();

    await socket.sendMessage(
      socket.user!.id,
      {
        text: phones.join('\n'),
      },
      { quoted: message },
    );

    await socket.reactToDone();
  }
}
