import type { SocketClient } from '$infrastructure/whatsapp/types';
import { isShellOn } from '$support/boolean.support';
import { getMessageCaption } from '$support/whatsapp.support';
import type { WAMessage } from '@whiskeysockets/baileys';
import { Context, createGuard, OnText, Socket } from 'baileys-decorators';
import { $ } from 'bun';

const OnlyMe = createGuard((socket, message) => {
  return !!message.key.fromMe;
});

const OnlyShellOn = createGuard((socket, message) => {
  return isShellOn;
});

export class ShellHandler {
  @OnText('$', {
    matchType: 'startsWith',

    guard: [OnlyMe, OnlyShellOn],
  })
  async shell(@Socket socket: SocketClient, @Context message: WAMessage) {
    if (!message.key.fromMe) {
      return;
    }
    const caption = getMessageCaption(message.message!).replace(
      /^\$(\s+)?/,
      '',
    );

    const { stdout, stderr } = await $`${{ raw: caption }}`;
    const stderrStr = stderr ? stderr.toString().trim() : '';
    const stdoutStr = stdout ? stdout.toString().trim() : '';

    if (stderrStr) {
      await socket.replyQuote({
        text: stderrStr,
      });
    }

    if (stdoutStr) {
      await socket.replyQuote({
        text: stdoutStr,
      });
    }
  }
}
