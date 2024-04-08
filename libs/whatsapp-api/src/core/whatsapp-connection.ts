import * as baileys from '@whiskeysockets/baileys';

import type { P } from 'pino';
import {
  MyDisconnectReason,
  WhatsappError,
} from '../../../../src/errors/WhatsappError';

export class WhatsappConnection {
  public socket!: baileys.WASocket;
  public status: baileys.WAConnectionState = 'close';
  private onSockets: ((socket: baileys.WASocket) => void)[] = [];

  constructor(
    private readonly authStore: {
      state: baileys.AuthenticationState;
      saveCreds: () => Promise<void>;
    },
    private readonly logger: P.Logger,
  ) {}

  onSocket(cb: (socket: baileys.WASocket) => void) {
    this.onSockets.push(cb);
  }

  async connectToWhatsapp() {
    const { saveCreds, state } = this.authStore;
    const { version, isLatest } = await baileys.fetchLatestBaileysVersion();

    this.socket = baileys.makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: state.keys,
      },
      browser: ['PersonalAsistant', 'Chrome', '0.0.0'],
      // @ts-ignore
      logger: this.logger,
      generateHighQualityLinkPreview: true,
      printQRInTerminal: true,
      syncFullHistory: false,
    });

    this.onSockets.map((callback) => callback(this.socket));

    this.socket.ev.on('creds.update', saveCreds);
    this.socket.ev.on('messages.upsert', (update) => {
      this.logger.info(update, 'messages.upsert');
    });
    this.resolveClientConnection();
  }

  protected resolveClientConnection(): void {
    this.socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection) this.status = connection;
      let shouldReconnect: boolean =
        connection === 'close' &&
        (lastDisconnect?.error as any)?.output?.statusCode !==
          baileys.DisconnectReason.loggedOut;

      if (lastDisconnect?.error instanceof WhatsappError) {
        const { message, statusCode }: { message: string; statusCode: string } =
          JSON.parse(lastDisconnect.error.message);
        this.logger.error(message, 'WhatsappError');

        if (statusCode === MyDisconnectReason.exitApp) {
          this.logger.info('Exiting...');
          shouldReconnect = false;
        }
      }

      if (shouldReconnect) {
        this.logger.info('Reconnecting...');
        return this.connectToWhatsapp();
      }

      return;
    });
  }
}
