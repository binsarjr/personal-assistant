import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import {
  BufferJSON,
  initAuthCreds,
  proto,
  type AuthenticationCreds,
} from '@whiskeysockets/baileys';

@Injectable()
export class WhatsappAuthService {
  constructor(private readonly prisma: PrismaService) {}
  async execute(deviceId: string) {
    const creds: AuthenticationCreds =
      (await this.read(deviceId, 'creds')) || initAuthCreds();

    return {
      state: {
        creds: creds,
        keys: {
          get: async (type: any, ids: any) => {
            // @ts-ignore
            const data: { [_: string]: SignalDataTypeMap[typeof type] } = {};
            await Promise.all(
              ids.map(async (id: string) => {
                let value = await this.read(
                  deviceId,
                  `authstore-${type}-${id}`,
                );
                if (type === 'app-state-sync-key' && value) {
                  value = proto.Message.AppStateSyncKeyData.fromObject(value);
                }

                data[id] = value;
              }),
            );

            return data;
          },
          set: async (data: any) => {
            const tasks: Promise<void>[] = [];
            for (const type in data) {
              for (const id in data[type]) {
                const value = data[type][id];
                const storeId = `authstore-${type}-${id}`;
                tasks.push(
                  value
                    ? this.write(deviceId, value, storeId)
                    : this.removeData(deviceId, storeId),
                );
              }
            }

            await Promise.all(tasks);
          },
        },
      },
      saveCreds: () => {
        return this.write(deviceId, creds, 'creds');
      },
    };
  }

  private async read(deviceId: string, type: string) {
    try {
      const data = await this.prisma.authSessionStore.findFirst({
        where: {
          type,
          deviceId: deviceId,
        },
      });

      if (!data) return null;

      return JSON.parse(data.data, BufferJSON.reviver);
    } catch (e: any) {
      console.log('Trying to read non existent session data');
      console.log(e.toString());
      return null;
    }
  }

  private async write(deviceId: string, data: any, type: string) {
    try {
      data = JSON.stringify(data, BufferJSON.replacer);

      await this.prisma.authSessionStore.upsert({
        where: {
          deviceId_type: { type, deviceId: deviceId },
        },
        update: {
          data,
        },
        create: {
          type,
          deviceId: deviceId,
          data,
        },
      });
    } catch (e: any) {
      console.error(e.toString(), 'An error occured during session delete');
    }
  }

  private async removeData(deviceId: string, type: string) {
    try {
      await this.prisma.authSessionStore.delete({
        select: { id: true },
        where: {
          deviceId_type: { type, deviceId: deviceId },
        },
      });
    } catch (error: any) {
      console.error(error.toString(), 'An error occured during session delete');
    }
  }
}
