import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { getJid, WhatsappMessageAction } from '../../whatsapp/src';
import { WhatsappMessage } from '../../whatsapp/src/decorators/whatsapp-message.decorator';

@WhatsappMessage({
  flags: 'hello',
})
export class HelloWorldAction extends WhatsappMessageAction {
  public async execute(socket: WASocket, message: WAMessage) {
    socket.sendMessage(getJid(message), {
      text: 'hello world',
    });
  }
}
