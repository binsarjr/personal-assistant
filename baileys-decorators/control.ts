import { eventStore } from '$baileys-decorators/store/event-store';
import type { BaileysEventMap, makeWASocket } from '@whiskeysockets/baileys';

export class BaileysDecorator {
  static bind(socket: ReturnType<typeof makeWASocket>) {
    socket.ev.process(async (events) => {
      for (const event of Object.keys(events)) {
        const eventData = events[event as keyof BaileysEventMap];

        for (const { method, parameters } of eventStore.get(
          event as keyof BaileysEventMap,
        ) || []) {
          const args: { [key: string]: any } = {};

          for (const [parameterName, decoratorType] of Object.entries(
            parameters,
          )) {
            if (decoratorType === 'socket') {
              args[parameterName] = socket;
            } else if (decoratorType === 'eventBody') {
              args[parameterName] = eventData;
            }
          }

          await method(...Object.values(args));
        }
      }
    });
  }
}
