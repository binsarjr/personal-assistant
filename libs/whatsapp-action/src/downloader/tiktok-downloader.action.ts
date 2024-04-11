import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSignRegex } from '@app/whatsapp/supports/flag.support';
import { getMessageCaption } from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

@WhatsappMessage({
  flags: [withSignRegex('tt .*')],
})
export class TiktokDownloaderAction extends WhatsappMessageAction {
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
      await socket.sendMessage(
        jid,
        {
          text: 'Please provide a valid TikTok URL',
        },
        { quoted: message },
      );

      this.reactToInvalid(socket, message);
      return;
    }

    let anyError = false;
    await Promise.all(
      urls.map(async (url) => {
        const { video, images } = await this.download(url.toString());
        if (!video && images.length === 0) anyError = true;
        if (video)
          await socket.sendMessage(
            jid,
            {
              video: {
                url: video,
              },
            },
            { quoted: message },
          );
        for (const image of images) {
          await socket.sendMessage(
            jid,
            {
              image: { url: image },
            },
            { quoted: message },
          );
        }
      }),
    );
    anyError
      ? this.reactToFailed(socket, message)
      : this.reactToDone(socket, message);
  }
  protected downloadBraveDown = async (link: string) => {
    const resp = await fetch(
      'https://mediasaver.binsarjr.com/services/bravedown/tiktok-downloader?url=' +
        link,
    );
    const json = (await resp.json()) as {
      data: {
        links: {
          url: string;
          type: 'video';
          mute: boolean;
          quality: string;
        }[];
      };
    };

    const video =
      json.data.links.find(
        (d) =>
          d.type === 'video' &&
          d.quality.toLowerCase().includes('no watermark') &&
          !d.mute,
      )?.url || '';
    return { video, images: [] };
  };

  protected download = async (
    link: string,
  ): Promise<{ video: string; images: string[] }> => {
    const bravedown = this.downloadBraveDown(link);
    const resp = await fetch(
      'https://mediasaver.binsarjr.com/services/tiktok/snaptik?url=' + link,
    );
    let json = (await resp.json()) as { video: string; images: string[] };

    if (!json.video && json.images.length == 0) {
      json = await bravedown;
    }
    return json;
  };
}
