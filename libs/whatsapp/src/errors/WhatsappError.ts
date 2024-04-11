import { DisconnectReason } from '@whiskeysockets/baileys';

export enum MyDisconnectReason {
  exitApp = 'exitApp',
}

export class WhatsappError extends Error {
  constructor(output: {
    message: string;
    statusCode: DisconnectReason | MyDisconnectReason;
  }) {
    super(JSON.stringify({ ...output }));
    this.name = 'WhatsappError';
  }
}
