import { WhatsappStoreService } from '@app/whatsapp/core/whatsapp-store.service';
import { Injectable } from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';

import { PrismaService } from '@app/prisma';
import { WhatsappAuthService } from '@app/whatsapp/core/whatsapp-auth.service';
import { WhatsappEventService } from '@app/whatsapp/core/whatsapp-event.service';
import { WhatsappMessageService } from '@app/whatsapp/core/whatsapp-message.service';
import {
  MyDisconnectReason,
  WhatsappError,
} from '@app/whatsapp/errors/WhatsappError';
import { Logger } from '@services/logger';

@Injectable()
export class WhatsappConnectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly store: WhatsappStoreService,
    private readonly authService: WhatsappAuthService,
    private readonly whatsappMessageService: WhatsappMessageService,
    private readonly whatsappEventService: WhatsappEventService,
  ) {}

  async connectingAllDevice() {
    const devices = await this.prisma.device.findMany();
    devices.map((device) => {
      this.connectToWhatsapp(device.id);
    });
  }

  async connectToWhatsapp(deviceId: string) {
    const logger = Logger({ name: 'WhatsappConnectionService-' + deviceId });
    const { saveCreds, state } = await this.authService.execute(deviceId);
    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: state.keys,
      },
      browser: ['PersonalAsistant', 'Chrome', '0.0.0'],
      // @ts-expect-error: no error
      logger: logger,
      generateHighQualityLinkPreview: true,
      printQRInTerminal: true,
    });

    this.store.set(deviceId, {
      socket,
      logger,
    });

    socket.ev.on('creds.update', saveCreds);
    socket.ev.on('messages.upsert', (update) => {
      this.whatsappMessageService.execute(socket, update);
    });
    this.whatsappEventService.bind(socket);

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
