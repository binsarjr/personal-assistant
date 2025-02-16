import type { SocketClient } from '$infrastructure/whatsapp/types';
import { type WAMessage, jidDecode } from '@whiskeysockets/baileys';
import { Context, OnText, Socket } from 'baileys-decorators';

export class ExtractPhoneNumberHandler {
  @OnText('.phones')
  async execute(@Socket socket: SocketClient, @Context message: WAMessage) {
    if (!message.key.fromMe) {
      return;
    }

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
