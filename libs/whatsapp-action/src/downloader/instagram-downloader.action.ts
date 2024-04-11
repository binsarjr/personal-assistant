import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getMessageCaption } from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSignRegex('ig .*')],
})
export class InstagramDownloaderAction extends WhatsappMessageAction {
  async execute(socket: WASocket, message: WAMessage) {
    this.reactToProcessing(socket, message);
    const text = getMessageCaption(message.message!);

    const urls: URL[] = [];
    text.split(/\s+/).map((url) => {
      try {
        urls.push(new URL(url));
      } catch (error) {}
    });
    const jid = message.key.remoteJid!;

    if (urls.length === 0) {
      socket.sendMessage(
        jid,
        {
          text: 'Please provide a valid Instagram URL',
        },
        { quoted: message },
      );
      this.reactToInvalid(socket, message);

      return;
    }

    await Promise.all(
      urls.map(async (url) => {
        const { success, data } = await this.download(url.toString());
        if (success) {
          for (const { thumb, url, is_video } of data) {
            if (is_video) {
              await socket.sendMessage(
                jid,
                {
                  video: {
                    url,
                  },
                },
                { quoted: message },
              );
            } else {
              await socket.sendMessage(
                jid,
                {
                  image: {
                    url,
                  },
                },
                { quoted: message },
              );
            }
          }
        }
      }),
    );
    this.reactToDone(socket, message);
  }
  protected download = async (link: string) => {
    const resp = await fetch(
      'https://mediasaver.binsarjr.com/services/igdownloader?url=' + link,
    );
    const json: {
      success: boolean;
      data: { thumb: string; url: string; is_video: boolean }[];
    } = await resp.json();
    return json;
  };
}
