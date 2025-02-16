import { commandMiddlewareMap } from '$core/decorators/command-middleware';
import {
  HandlerCommandRegistry,
  type HandlerCommandEntry,
} from '$core/di/handler-command.registry';
import { logger } from '$infrastructure/logger/console.logger';
import makeInMemoryStore from '$infrastructure/whatsapp/make-in-memory-store';
import type { SocketClient } from '$infrastructure/whatsapp/types';
import { hidden_path } from '$support/file.support';
import { getMessageCaption } from '$support/whatsapp.support';
import makeWASocket, {
  delay,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  proto,
  useMultiFileAuthState,
  type WAMessage,
  type WAMessageKey,
} from '@whiskeysockets/baileys';
import { BaileysDecorator } from 'baileys-decorators';
import NodeCache from 'node-cache';
import 'reflect-metadata';

export class WhatsappClient {
  // @ts-expect-error: nullable
  private client: SocketClient;

  private groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false });

  private msgRetryCounterCache = new NodeCache();

  constructor(
    private readonly deviceId: string,
    private readonly connectUsing: 'qrcode' | 'pairing' = 'qrcode',
    private readonly useStore:
      | ReturnType<typeof makeInMemoryStore>
      | undefined = undefined,
  ) {
    this.useStore = makeInMemoryStore({
      logger: logger.child({ module: 'baileys-multi-store' }),
    });

    const pathlocation = hidden_path(deviceId, 'baileys_store_multi.json');
    this.useStore?.readFromFile(pathlocation);
    // save every 10s
    setInterval(() => {
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

    BaileysDecorator.bind(this.client);
    this.useStore?.bind(this.client.ev);
    this.setupEventHandlers();
    this.setupCredsSaver(saveCreds);
  }

  private setupEventHandlers() {
    this.client.ev.process(async (events) => {
      logger.debug(events, 'events');

      if (events['connection.update']) {
        const update = events['connection.update'];

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
        {
          logger.debug('Caching group metadata');
          const event = events['group-participants.update'];
          const metadata = await this.client.groupMetadata(event.id);
          this.groupCache.set(event.id, metadata);
        }
      }

      if (events['messages.upsert']) {
        for (const message of events['messages.upsert'].messages) {
          if (!message.message) continue;
          await this, this.processMessage(message);
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

  private async processMessage(message: WAMessage) {
    logger.trace('Processing message');

    const caption = getMessageCaption(message.message!);

    const handlers = HandlerCommandRegistry.getHandlers(caption);

    for (const handler of handlers) {
      if (!(await this.resolveCommandMiddleware(handler, message))) continue;
      try {
        const params = this.resolveHandlerParameters(handler, message);
        logger.debug(params, 'Parameters');
        logger.info(handler, 'Calling handler');
        await handler.handler(...params);
      } catch (error) {
        // this.client.sendMessage(message.key.remoteJid!, {
        // 	react: {
        // 		key: message.key!,
        // 		text: "❌",
        // 	},
        // });
        logger.error(error, 'Error handling message');
      }
    }
  }

  private async resolveCommandMiddleware(
    handler: HandlerCommandEntry,
    message: WAMessage,
  ) {
    const middlewares =
      commandMiddlewareMap.get(handler.className + ':' + handler.methodName) ||
      [];

    for (const middleware of middlewares) {
      logger.trace(
        middleware,
        'Middleware: ' + handler.className + ':' + handler.methodName,
      );
      if (!(await middleware(this.client, message))) return false;
    }

    return true;
  }

  private resolveHandlerParameters(
    handler: HandlerCommandEntry,
    ctx: WAMessage,
  ): any[] {
    logger.trace('Resolving handler parameters');
    const params = [];
    const paramCount = handler.handler.length;

    // Cari parameter yang perlu diisi socket
    for (let i = 0; i < paramCount; i++) {
      if (handler?.meta?.socketParamIndex === i) {
        logger.trace('Injecting message.upsert function');

        const react = (emoji: string) => {
          return this.client.sendMessage(ctx.key.remoteJid!, {
            react: {
              key: ctx.key!,
              text: emoji,
            },
          });
        };

        const reply: SocketClient['reply'] = async (content, options) => {
          if (!ctx) return;
          const jid = ctx.key.remoteJid!;
          if (options?.typing) {
            await this.client.presenceSubscribe(jid);
            await delay(500);

            await this.client.sendPresenceUpdate('composing', jid);
            await delay(2000);
          }

          const msg = await this.client.sendMessage(jid, content, options);

          if (options?.typing) {
            await this.client.sendPresenceUpdate('paused', jid);
          }

          return msg;
        };

        const replyQuote: SocketClient['replyQuote'] = async (
          content,
          options,
        ) => {
          if (!ctx) return;
          const jid = ctx.key.remoteJid!;
          if (options?.typing) {
            await this.client.presenceSubscribe(jid);
            await delay(500);

            await this.client.sendPresenceUpdate('composing', jid);
            await delay(2000);
          }

          const msg = await this.client.sendMessage(jid, content, {
            ...options,
            quoted: ctx,
          });
          if (options?.typing) {
            await this.client.sendPresenceUpdate('paused', jid);
          }

          return msg;
        };

        const replyQuoteInPrivate: SocketClient['replyQuoteInPrivate'] = async (
          content,
          options,
        ) => {
          if (!ctx) return;
          const jid = ctx.key.participant || ctx.key.remoteJid!;

          if (options?.typing) {
            await this.client.presenceSubscribe(jid);
            await delay(500);

            await this.client.sendPresenceUpdate('composing', jid);
            await delay(2000);
          }

          const msg = await this.client.sendMessage(jid, content, {
            ...options,
            quoted: ctx,
          });
          if (options?.typing) {
            await this.client.sendPresenceUpdate('paused', jid);
          }

          return msg;
        };

        params[i] = {
          ...this.client,
          react,
          reactToProcessing: () => react('⏳'),
          resetReact: () => react(''),
          reactToDone: () => react('✅'),
          reactToFailed: () => react('❌'),
          reply,
          replyQuote,
          replyQuoteInPrivate,
          store: this.useStore,
        } as SocketClient;
      } else {
        params[i] = ctx; // Default ke message context
      }
    }

    return params;
  }
}
