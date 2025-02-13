// File: onEventDecorator.ts
import { eventStore } from '$baileys-decorators/store/event-store';
import type { BaileysEventMap } from '@whiskeysockets/baileys';

export const OnEvent = (
  event: keyof BaileysEventMap,
  options: { priority?: number } = {},
) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    // Ambil metadata parameter yang didekorasi
    const parameters: { [key: string]: 'socket' | 'baileys-context' } =
      Reflect.getMetadata('parameters', target, propertyKey) || {};

    if (!eventStore.has(event)) {
      eventStore.set(event, []);
    }

    eventStore.get(event)?.push({
      method,
      priority: options.priority || 0,
      parameters, // Simpan informasi parameter yang didekorasi,
      classRef: target.constructor,
    });

    eventStore.get(event)?.sort((a, b) => b.priority - a.priority);
  };
};
