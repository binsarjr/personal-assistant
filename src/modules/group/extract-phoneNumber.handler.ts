import { PREFIX_COMMAND } from '$infrastructure/config/consts.config';
import {
    type WAMessage
} from '@whiskeysockets/baileys';
import { Context, OnText, Socket, type SocketClient } from 'baileys-decorators';

export class ExtractPhoneNumberHandler {
  @OnText(PREFIX_COMMAND + 'phones')
  async execute(@Socket socket: SocketClient, @Context message: WAMessage) {
    if (!message.key.fromMe) {
      return;
    }

    const metadata = undefined; // wa_store.fetchGroupMetadata removed
    // const participants = metadata.participants; // commented out since metadata is undefined
    // const phones = participants
    //   .map((participant) => jidDecode(participant.id)?.user)
    //   .filter(Boolean);

    await socket.reactToProcessing();

    await socket.sendMessage(
      socket.user!.id,
      {
        text: 'Phones not available in this group.', // Placeholder for phones
      },
      { quoted: message },
    );

    await socket.reactToDone();
  }
}
