import * as baileys from '@whiskeysockets/baileys';

import type { P } from 'pino';

export class WhatsappConnection {
  public socket!: baileys.WASocket;
  public status: baileys.WAConnectionState = 'close';

  constructor(
    private readonly authStore: {
      state: baileys.AuthenticationState;
      saveCreds: () => Promise<void>;
    },
    private readonly logger: P.Logger,
  ) {}

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
    });

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

      const shouldReconnect: boolean =
        connection === 'close' &&
        (lastDisconnect?.error as any)?.output?.statusCode !==
          baileys.DisconnectReason.loggedOut;

      if (shouldReconnect) {
        return this.connectToWhatsapp();
      }

      return;
    });
  }
}
