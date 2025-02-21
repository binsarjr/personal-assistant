import { PREFIX_COMMAND } from '$infrastructure/config/consts.config';
import wa_store from '$infrastructure/whatsapp/whatsapp-store';
import {
  type WAMessage,
  type WASocket,
  jidDecode,
} from '@whiskeysockets/baileys';
import { Context, OnText, Socket, type SocketClient } from 'baileys-decorators';

export class ExtractPhoneNumberHandler {
  @OnText(PREFIX_COMMAND + 'phones')
  async execute(@Socket socket: SocketClient, @Context message: WAMessage) {
    if (!message.key.fromMe) {
      return;
    }

    const metadata = await wa_store.fetchGroupMetadata(
      message.key.remoteJid!,
      socket as unknown as WASocket,
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
