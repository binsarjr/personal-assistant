import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

export abstract class WhatsappAction {
  abstract execute(socket: WASocket): Promise<void>;
}

export abstract class WhatsappMessageAction {
  abstract execute(socket: WASocket, message: WAMessage): Promise<void>;
}
