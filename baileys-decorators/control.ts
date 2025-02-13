import { eventStore } from '$baileys-decorators/store/event-store';
import { textEventStore } from '$baileys-decorators/store/text-event-store';
import type { BaileysEventMap, makeWASocket } from '@whiskeysockets/baileys';

export class BaileysDecorator {
  /**
   * Memuat dekorator dari path yang diberikan dengan pola file yang bisa dikustomisasi.
   */
  static async loadDecorators(
    patterns: string[] = [],
    loader: (files: Record<string, any>) => void = (files) => {
      console.log(`✅ Loaded ${Object.keys(files).length} decorators`);
    },
  ) {
    let allDecorators: Record<string, any> = {};

    for (const pattern of patterns) {
      console.log(pattern);
      const glob = new Bun.Glob(pattern);

      for await (const filepath of glob.scan()) {
        const module = await import(filepath);
        Object.assign(allDecorators, module);
      }
    }

    loader(allDecorators);
  }

  static bind(socket: ReturnType<typeof makeWASocket>) {
    socket.ev.process(async (events) => {
      for (const event of Object.keys(events)) {
        const eventData = events[event as keyof BaileysEventMap];

        // on-event
        for (const { method, parameters, classRef: target } of eventStore.get(
          event as keyof BaileysEventMap,
        ) || []) {
          const args: { [key: string]: any } = {};
          const instance = new target(); // Buat instance baru jika berasal dari class

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
            await method.bind(instance)(...Object.values(args)); // Pastikan method terikat ke instance class
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
            for (const {
              matchType,
              method,
              parameters,
              classRef: target,
            } of handlers) {
              let isMatch = false;
              const instance = new target(); // Pastikan ada instance yang digunakan

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
                  await method.bind(instance)(...args);
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
