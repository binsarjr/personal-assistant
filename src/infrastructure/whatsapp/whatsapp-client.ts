import { logger } from '$infrastructure/logger/console.logger';
import makeInMemoryStore from '$infrastructure/whatsapp/make-in-memory-store';
import type { SocketClient } from '$infrastructure/whatsapp/types';
import { hidden_path } from '$support/file.support';
import makeWASocket, {
  DisconnectReason,
  makeCacheableSignalKeyStore,
  proto,
  useMultiFileAuthState,
  type WAMessageKey,
} from '@whiskeysockets/baileys';
import type { WAConnectionState, WASocket } from 'baileys';
import { BaileysDecorator } from 'baileys-decorators';
import NodeCache from 'node-cache';
import 'reflect-metadata';

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
    private readonly useStore:
      | ReturnType<typeof makeInMemoryStore>
      | undefined = undefined,
  ) {
    const pathlocation = hidden_path(deviceId, 'baileys_store_multi.json');
    this.useStore?.readFromFile(pathlocation);
    // save every 10s
    setInterval(async () => {
      const messages = this.useStore?.messages;
      if (messages) {
        Object.keys(messages as Object).map((jid) => {
          const list = messages[jid];
          list.filter((m) => {
            const messageTime = +(m.messageTimestamp || 0);

            const oneWeekInSeconds = 7 * 24 * 60 * 60;
            const currentTime = Math.floor(Date.now() / 1000);

            return currentTime - messageTime <= oneWeekInSeconds;
          });
        });
      }
      this.useStore?.writeToFile(pathlocation);
    }, 10_000);
  }

  async initialize() {
    const { state, saveCreds } = await useMultiFileAuthState(
      hidden_path(this.deviceId, 'auth-store'),
    );

    this.client = makeWASocket({
      auth: {
        creds: state.creds,
        /** caching makes the store faster to send/recv messages */
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      printQRInTerminal: this.connectUsing == 'qrcode',
      logger: logger.child({ module: 'baileys' }),
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      msgRetryCounterCache: this.msgRetryCounterCache,
      markOnlineOnConnect: false,

      cachedGroupMetadata: async (jid) => this.groupCache.get(jid),
      getMessage: async (key: WAMessageKey) => {
        if (this.useStore) {
          const msg = await this.useStore.loadMessage(key.remoteJid!, key.id!);
          return msg?.message || undefined;
        }

        // only if store is present
        return proto.Message.fromObject({});
      },
    }) as SocketClient;

    BaileysDecorator.bind(this.client as unknown as WASocket);
    this.useStore?.bind(this.client.ev);
    this.setupEventHandlers();
    this.setupCredsSaver(saveCreds);
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
          const metadata = await this.client.store.fetchGroupMetadata(
            event.id!,
            this.client,
          );
          this.groupCache.set(event.id!, metadata);
        }
      }

      if (events['group-participants.update']) {
        {
          logger.debug('Caching group metadata');
          const event = events['group-participants.update'];
          const metadata = await this.client.store.fetchGroupMetadata(
            event.id,
            this.client,
          );
          this.groupCache.set(event.id, metadata);
        }
      }
    });
  }

  private handleReconnect(error: any) {
    if (error?.output?.statusCode !== DisconnectReason.loggedOut) {
      setTimeout(() => this.initialize(), 3000);
    }
  }

  private setupCredsSaver(saveCreds: () => Promise<void>) {
    this.client.ev.on('creds.update', saveCreds);
  }
}
