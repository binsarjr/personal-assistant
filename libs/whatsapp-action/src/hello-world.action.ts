import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { getJid, WhatsappMessageAction } from '../../whatsapp/src';
import { IsEligible } from '../../whatsapp/src/decorators/is-eligible.decorator';
import { WhatsappMessage } from '../../whatsapp/src/decorators/whatsapp-message.decorator';

@WhatsappMessage({
  flags: 'hello',
})
export class HelloWorldAction extends WhatsappMessageAction {
  @IsEligible()
  public onlyMe(socket: WASocket, message: WAMessage) {
    console.log('only me');
    console.log(message);
    console.log('only me');
    return true;
  }

  @IsEligible()
  public onlyMe2(socket: WASocket, message: WAMessage) {
    console.log('only me 2');
    console.log(message);
    console.log('only me 2');

    return false;
  }

  public async execute(socket: WASocket, message: WAMessage) {
    socket.sendMessage(getJid(message), {
      text: 'hello world',
    });
  }
}
