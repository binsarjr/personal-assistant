import { WhatsappMessage } from '@app/whatsapp/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import { withSign } from '@app/whatsapp/supports/flag.support';
import {
  downloadContentBufferFromMessage,
  getJid,
  getMessageFromViewOnce,
} from '@app/whatsapp/supports/message.support';
import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import * as FormData from 'form-data';
import got, { RequestError } from 'got';

@WhatsappMessage({
  flags: withSign('hd'),
})
export class ConvertToHDAction extends WhatsappMessageAction {
  async execute(socket: WASocket, _message: WAMessage) {
    this.reactToProcessing(socket, _message);

    const message = getMessageFromViewOnce(_message);

    let mediaKey: Uint8Array | null | undefined;
    let directPath: string | null | undefined;
    let url: string | null | undefined;

    if (
      message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
    ) {
      mediaKey =
        message!.extendedTextMessage!.contextInfo!.quotedMessage!.imageMessage!
          .mediaKey;
      directPath =
        message!.extendedTextMessage!.contextInfo!.quotedMessage!.imageMessage!
          .directPath;
      url =
        message!.extendedTextMessage!.contextInfo!.quotedMessage!.imageMessage!
          .url;
    } else if (message?.imageMessage) {
      mediaKey = message!.imageMessage!.mediaKey;
      directPath = message!.imageMessage!.directPath;
      url = message!.imageMessage!.url;
    } else {
      this.resetReact(socket, _message);
      return;
    }

    const photoBuffer: Buffer = await downloadContentBufferFromMessage(
      { directPath, mediaKey, url },
      'image',
    );

    const data = new FormData();
    data.append('image', photoBuffer, 'image.jpg');
    data.append('scale', '4');

    try {
      const result = await got
        .post('https://api2.pixelcut.app/image/upscale/v1', {
          body: data,
          headers: {
            accept: 'application/json',
            'user-agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36' +
              Date.now(),
          },
        })
        .json<{ result_url: string }>();

      if (!result.result_url) {
        this.reactToFailed(socket, _message);

        return;
      }

      await socket.sendMessage(
        getJid(_message),
        {
          image: {
            url: result.result_url,
          },
        },
        { quoted: _message },
      );
      await this.reactToDone(socket, _message);
    } catch (err) {
      if (err instanceof RequestError) {
        const { error, error_code } = JSON.parse(
          err.response!.body as string,
        ) as {
          error: string;
          error_code: string;
        };
        await socket.sendMessage(
          getJid(_message),
          {
            text: `Error Code ${error_code}: ${error}`,
          },
          { quoted: _message },
        );
        await this.reactToFailed(socket, _message);

        return;
      }
      throw err;
    }
  }
}
