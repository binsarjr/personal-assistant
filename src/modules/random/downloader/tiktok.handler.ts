import { tiktokdl } from '$services/downloader/tiktok';
import { firstValidData } from '$support/promise.support';
import type { WAMessage } from '@whiskeysockets/baileys';
import {
  Context,
  getMessageCaption,
  OnText,
  Socket,
  type SocketClient,
} from 'baileys-decorators';

export default class {
  @OnText('.tt', { matchType: 'startsWith' })
  async tt(@Socket socket: SocketClient, @Context message: WAMessage) {
    await socket.reactToProcessing();
    const captions = getMessageCaption(message.message!);
    const urls = captions
      .split(/(\s+|\n+)/)
      .filter((caption) => caption.startsWith('http'));
    if (urls.length === 0) {
      await socket.replyWithQuote({
        text: 'Pastikan url yang diinput valid. Contoh: .tt https://vt.tiktok.com/ZSjA3BsadCS1/',
      });
      await socket.reactToInvalid();
      return;
    }

    for (const url of urls) {
      const res = await firstValidData([
        tiktokdl.ttsave(url),
        tiktokdl.ssateam(url),
        tiktokdl.tiklydown(url),
        tiktokdl.vapis.ttdlv2(url),
        tiktokdl.vapis.ttdlv(url),
        tiktokdl.nasirxml.tiktok(url),
        tiktokdl.diioffc(url),
      ]);

      if (!res) {
        await socket.replyWithQuote({
          text: 'Maaf, tidak dapat menemukan untuk ' + url,
        });
        continue;
      }

      if (res.video) {
        await socket.replyWithQuote({
          caption: res.caption,
          video: {
            url: res.video,
          },
        });
      }

      if (res.slides?.length) {
        await Promise.allSettled(
          res.slides.map(async (image) => {
            await socket.replyWithQuote({
              image: {
                url: image,
              },
            });
          }),
        );
        await socket.replyWithQuote({
          text: res.caption,
        });
      }

      if (res?.audio)
        await socket.replyWithQuote({
          audio: {
            url: res.audio,
          },
          mimetype: 'audio/mp4',
        });
    }

    await socket.reactToDone();
  }
}
