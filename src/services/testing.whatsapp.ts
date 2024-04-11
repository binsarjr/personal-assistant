import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { WhatsappMessage } from '../../libs/whatsapp/src/decorators/whatsapp-message.decorator';
import { WhatsappMessageAction } from '../../libs/whatsapp/src/interfaces/whatsapp.interface';

@WhatsappMessage()
export class TestingWhatsapp extends WhatsappMessageAction {
  public async execute(socket: WASocket, message: WAMessage) {
    console.log('TestingWhatsapp', message);
  }
}
