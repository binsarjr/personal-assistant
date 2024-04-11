import { Injectable } from '@nestjs/common';
import type { WASocket } from '@whiskeysockets/baileys';
import type { P } from 'pino';

export type WhatsappStore = {
  socket: WASocket;
  logger: P.Logger;
};

@Injectable()
export class WhatsappStoreService {
  protected store: Map<string, WhatsappStore> = new Map();

  get(deviceId: string): WhatsappStore {
    return this.store.get(deviceId);
  }

  set(deviceId: string, store: WhatsappStore) {
    this.store.set(deviceId, store);
  }

  delete(deviceId: string) {
    this.store.delete(deviceId);
  }

  clear() {
    this.store.clear();
  }

  has(deviceId: string) {
    return this.store.has(deviceId);
  }
}
