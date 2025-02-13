import type { BaileysEventMap } from '@whiskeysockets/baileys';

export const eventStore = new Map<
  keyof BaileysEventMap,
  Array<{
    method: Function;
    priority: number;
    parameters: { [key: string]: 'socket' | 'eventBody' };
  }>
>();
