import { logger } from '$infrastructure/logger/console.logger'
import { hidden_path } from '$support/file.support'
import makeWASocket, {
  DisconnectReason,
  makeCacheableSignalKeyStore,
  proto,
  useMultiFileAuthState,
  type WAMessageKey,
} from '@whiskeysockets/baileys'
import {
  fetchLatestBaileysVersion,
  type WAConnectionState,
  type WASocket,
} from 'baileys'
import { BaileysDecorator, type SocketClient } from 'baileys-decorators'
import NodeCache from 'node-cache'
import { rm } from 'node:fs/promises'
// Tambahkan deklarasi module jika belum ada types
// @ts-expect-error: no types for qrcode-terminal
import qrcode from 'qrcode-terminal'
import 'reflect-metadata'

export class WhatsappClient {
  // @ts-expect-error: nullable
  private client: SocketClient;
  private currentConnection: WAConnectionState = 'close';

  private groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false });

  private msgRetryCounterCache = new NodeCache();

  async getClient() {
    while (true) {
      if (this.client?.ws?.isOpen && this.currentConnection == 'open') {
        return this.client;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  constructor(
    private readonly deviceId: string,
    private readonly connectUsing: 'qrcode' | 'pairing' = 'qrcode',
    private readonly phoneNumber?: string,
  ) {
    // Removed useStore and pathlocation logic
    // save every 10s (no-op, since useStore is removed)
    setInterval(async () => {
      // No operation needed
    }, 10_000);
  }

  async initialize() {
    const { state, saveCreds } = await useMultiFileAuthState(
      hidden_path(this.deviceId, 'auth-store'),
    );

    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

    this.client = makeWASocket({
      auth: {
        creds: state.creds,
        /** caching makes the store faster to send/recv messages */
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      version,
      browser: ['Personal Assistant', 'binsarjr', '0.0.0'],
      logger: logger.child({ module: 'baileys' }),
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      msgRetryCounterCache: this.msgRetryCounterCache,
      markOnlineOnConnect: false,

      cachedGroupMetadata: async (jid) => this.groupCache.get(jid),
      getMessage: async (key: WAMessageKey) => {
        // Removed useStore logic
        return proto.Message.fromObject({});
      },
    }) as unknown as SocketClient;

    BaileysDecorator.bind(this.client as unknown as WASocket);
    // Removed useStore?.bind(this.client.ev as any);
    this.setupEventHandlers();
    this.setupCredsSaver(saveCreds);

    this.client.authState.creds.pairingCode = '';
    this.client.ev.on('connection.update', async (update) => {
      // Jika mode qrcode, tampilkan QR code manual pakai qrcode-terminal
      if (this.connectUsing === 'qrcode' && update.qr) {
        console.log('\n==================================================');
        console.log('                Scan this QR code:');
        console.log('==================================================\n');
        qrcode.generate(update.qr, { small: true });
        console.log('\n==================================================\n');
      }
      // Jika pairing, setelah socket siap, cek registered dan tampilkan pairing code jika perlu
      console.log({
        connectUsing: this.connectUsing,
        phoneNumber: this.phoneNumber,
        currentConnection: this.currentConnection,
      });
      if (
        this.connectUsing === 'pairing' &&
        this.phoneNumber &&
        (update.connection == 'connecting' || !!update.qr)
      ) {
        // Cek apakah sudah registered
        if (!(this.client as any).authState?.creds?.registered) {
          console.log('\n==================================================');
          console.log('                Waiting for pairing code...');
          console.log('==================================================\n');
          try {
            const code = await (this.client as any).requestPairingCode(
              this.phoneNumber,
            );
            const formatted = code.match(/.{1,4}/g)?.join('-') ?? code;
            console.log('==================================================');
            console.log(`                Pairing Code: ${formatted}`);
            console.log('==================================================\n');
          } catch (err) {
            console.error('==================================================');
            console.error('              Failed to get pairing code');
            console.error(
              '==================================================\n',
            );
            console.error(err);
          }
        }
      }
    });
  }

  private setupEventHandlers() {
    this.client.ev.process(async (events) => {
      logger.debug(events, 'events');

      if (events['connection.update']) {
        const update = events['connection.update'];
        if (update.connection) this.currentConnection = update.connection;

        if (update.connection == 'close') {
          this.handleReconnect(update.lastDisconnect?.error);
        }
      }

      if (events['groups.update']) {
        const [event] = events['groups.update'];

        if (event.id) {
          logger.debug('Caching group metadata');
          const metadata = await this.client.groupMetadata(event.id!);
          this.groupCache.set(event.id!, metadata);
        }
      }

      if (events['group-participants.update']) {
        logger.debug('Caching group metadata');
        const event = events['group-participants.update'];
        const metadata = await this.client.groupMetadata(event.id!);
        this.groupCache.set(event.id, metadata);
      }
    });
  }

  private handleReconnect(error: any) {
    if (error?.output?.statusCode !== DisconnectReason.loggedOut) {
      this.initialize();
    } else {
      rm(hidden_path(this.deviceId, 'auth-store'), {
        recursive: true,
        force: true,
      }).then(() => {
        this.initialize();
      });
    }
  }

  private setupCredsSaver(saveCreds: () => Promise<void>) {
    this.client.ev.on('creds.update', saveCreds);
  }
}
