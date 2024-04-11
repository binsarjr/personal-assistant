import { Injectable, type OnModuleInit } from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import {
  MyDisconnectReason,
  WhatsappError,
} from '../../../../src/errors/WhatsappError';
import { Logger } from '../../../../src/services/logger';
import { PrismaService } from '../../../prisma/src';
import { WhatsappAuthService } from './whatsapp-auth.service';
import { WhatsappMessageService } from './whatsapp-message.service';
import { WhatsappStoreService } from './whatsapp-store.service';

@Injectable()
export class WhatsappConnectionService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly store: WhatsappStoreService,
    private readonly authService: WhatsappAuthService,
    private readonly whatsappMessageService: WhatsappMessageService,
  ) {}

  async onModuleInit() {
    const devices = await this.prisma.device.findMany();
    devices.map((device) => {
      this.connectToWhatsapp(device.id);
    });
  }

  async connectToWhatsapp(deviceId: string) {
    const logger = Logger({ name: 'WhatsappConnectionService-' + deviceId });
    const { saveCreds, state } = await this.authService.execute(deviceId);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: state.keys,
      },
      browser: ['PersonalAsistant', 'Chrome', '0.0.0'],
      // @ts-ignore
      logger: logger,
      generateHighQualityLinkPreview: true,
      printQRInTerminal: true,
      syncFullHistory: false,
    });

    this.store.set(deviceId, {
      socket,
      logger,
    });

    socket.ev.on('creds.update', saveCreds);
    socket.ev.on('messages.upsert', (update) => {
      this.whatsappMessageService.execute(socket, update);
    });

    this.resolveClientConnection(deviceId);
  }

  protected resolveClientConnection(deviceId: string): void {
    const { socket, logger } = this.store.get(deviceId);
    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      let shouldReconnect: boolean =
        connection === 'close' &&
        (lastDisconnect?.error as any)?.output?.statusCode !==
          DisconnectReason.loggedOut;

      if (lastDisconnect?.error instanceof WhatsappError) {
        const { message, statusCode }: { message: string; statusCode: string } =
          JSON.parse(lastDisconnect.error.message);
        logger.error(message, 'WhatsappError');

        if (statusCode === MyDisconnectReason.exitApp) {
          logger.info('Exiting...');
          shouldReconnect = false;
        }
      }

      if (shouldReconnect) {
        logger.info('Reconnecting...');
        return this.connectToWhatsapp(deviceId);
      }

      return;
    });
  }
}
