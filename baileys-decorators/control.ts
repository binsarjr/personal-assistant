import { eventStore } from '$baileys-decorators/store/event-store';
import { textEventStore } from '$baileys-decorators/store/text-event-store';
import type { BaileysEventMap, makeWASocket } from '@whiskeysockets/baileys';

export class BaileysDecorator {
  static bind(socket: ReturnType<typeof makeWASocket>) {
    socket.ev.process(async (events) => {
      for (const event of Object.keys(events)) {
        const eventData = events[event as keyof BaileysEventMap];

        // on-event
        for (const { method, parameters } of eventStore.get(
          event as keyof BaileysEventMap,
        ) || []) {
          const args: { [key: string]: any } = {};

          for (const [parameterName, decoratorType] of Object.entries(
            parameters,
          )) {
            if (decoratorType === 'socket') {
              args[parameterName] = socket;
            } else if (decoratorType === 'baileys-context') {
              args[parameterName] = eventData;
            }
          }

          try {
            await method(...Object.values(args));
          } catch (error) {
            console.error(error);
          }
        }
      }

      if (events['messages.upsert']) {
        for (const message of events['messages.upsert'].messages) {
          let text =
            message?.message?.conversation ||
            message?.message?.extendedTextMessage?.text;

          if (!text) continue;
          text = text.toLowerCase();

          // on-text
          for (const [key, handlers] of textEventStore.entries()) {
            for (const { matchType, method, parameters } of handlers) {
              let isMatch = false;

              switch (matchType) {
                case 'equals':
                  isMatch = text === key.toLowerCase();
                  break;
                case 'contains':
                  isMatch = text.includes(key.toLowerCase());
                  break;
                case 'startsWith':
                  isMatch = text.startsWith(key.toLowerCase());
                  break;
                case 'endsWith':
                  isMatch = text.endsWith(key.toLowerCase());
                  break;
                case 'regex':
                  isMatch = new RegExp(key, 'i').test(text);
                  break;
              }

              if (isMatch) {
                const args: any[] = [];

                Object.entries(parameters).forEach(([paramName, paramType]) => {
                  if (paramType === 'socket') args.push(socket);
                  if (paramType === 'baileys-context') args.push(message);
                });

                try {
                  await method(...args);
                } catch (error) {
                  console.error(error);
                }
              }
            }
          }
        }
      }
    });
  }
}
