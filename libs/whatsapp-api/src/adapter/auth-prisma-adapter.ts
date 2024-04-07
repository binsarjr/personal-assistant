import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import * as baileys from '@whiskeysockets/baileys';
import {
  type AuthenticationCreds,
  type SignalKeyStore,
} from '@whiskeysockets/baileys';

@Injectable()
export class WhatsappAuthPrismaAdapter {
  deviceId: string;

  constructor(private readonly prisma: PrismaService) {}

  make(deviceId: string) {
    this.deviceId = deviceId;
    return this.authentication();
  }
  private async authentication(): Promise<{
    state: { creds: AuthenticationCreds; keys: SignalKeyStore };
    saveCreds: () => Promise<void>;
  }> {
    const creds: AuthenticationCreds =
      (await this.read('creds')) || baileys.initAuthCreds();

    return {
      state: {
        creds: creds,
        keys: {
          get: async (type: any, ids: any) => {
            // @ts-ignore
            const data: { [_: string]: SignalDataTypeMap[typeof type] } = {};
            await Promise.all(
              ids.map(async (id: string) => {
                let value = await this.read(`authstore-${type}-${id}`);
                if (type === 'app-state-sync-key' && value) {
                  value =
                    baileys.proto.Message.AppStateSyncKeyData.fromObject(value);
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
                  value ? this.write(value, storeId) : this.removeData(storeId),
                );
              }
            }

            await Promise.all(tasks);
          },
        },
      },
      saveCreds: () => {
        return this.write(creds, 'creds');
      },
    };
  }

  private async read(type: string) {
    try {
      const data = await this.prisma.authSessionStore.findFirst({
        where: {
          type,
          deviceId: this.deviceId,
        },
      });

      if (!data) return null;

      return JSON.parse(data.data, baileys.BufferJSON.reviver);
    } catch (e: any) {
      console.log('Trying to read non existent session data');
      console.log(e.toString());
      return null;
    }
  }

  private async write(data: any, type: string) {
    try {
      data = JSON.stringify(data, baileys.BufferJSON.replacer);

      await this.prisma.authSessionStore.upsert({
        where: {
          deviceId_type: { type, deviceId: this.deviceId },
        },
        update: {
          data,
        },
        create: {
          type,
          deviceId: this.deviceId,
          data,
        },
      });
    } catch (e: any) {
      console.error(e.toString(), 'An error occured during session delete');
    }
  }

  private async removeData(type: string) {
    try {
      await this.prisma.authSessionStore.delete({
        select: { id: true },
        where: {
          deviceId_type: { type, deviceId: this.deviceId },
        },
      });
    } catch (error: any) {
      console.error(error.toString(), 'An error occured during session delete');
    }
  }
}
