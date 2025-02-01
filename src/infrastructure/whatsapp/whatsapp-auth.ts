import { prisma } from "$infrastructure/database/db";
import { logger } from "$infrastructure/logger/console.logger";
import {
	BufferJSON,
	initAuthCreds,
	proto,
	type AuthenticationCreds,
	type SignalDataTypeMap,
} from "@whiskeysockets/baileys";

export class WhatsappAuth {
	async execute(deviceId: string) {
		const creds: AuthenticationCreds =
			(await this.read(deviceId, "creds")) || initAuthCreds();

		return {
			state: {
				creds: creds,
				keys: {
					get: async (type: any, ids: any) => {
						// @ts-expect-error: type is not in type
						const data: { [_: string]: SignalDataTypeMap[typeof type] } = {};
						await Promise.all(
							ids.map(async (id: string) => {
								let value = await this.read(
									deviceId,
									`authstore-${type}-${id}`
								);
								if (type === "app-state-sync-key" && value) {
									value = proto.Message.AppStateSyncKeyData.fromObject(value);
								}

								data[id] = value;
							})
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
										: this.removeData(deviceId, storeId)
								);
							}
						}

						await Promise.all(tasks);
					},
				},
			},
			saveCreds: () => {
				return this.write(deviceId, creds, "creds");
			},
		};
	}

	private async read(deviceId: string, type: string) {
		try {
			const data = await prisma.authSessionStore.findFirst({
				where: {
					type,
					deviceId: deviceId,
				},
			});

			if (!data) return null;

			return JSON.parse(data.data, BufferJSON.reviver);
		} catch (e: any) {
			logger.error(e, "Trying to read non existent session data");
			return null;
		}
	}

	private async write(deviceId: string, data: any, type: string) {
		try {
			data = JSON.stringify(data, BufferJSON.replacer);

			await prisma.authSessionStore.upsert({
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
			logger.error(e, "An error occured during session delete");
		}
	}

	private async removeData(deviceId: string, type: string) {
		try {
			await prisma.authSessionStore.delete({
				select: { id: true },
				where: {
					deviceId_type: { type, deviceId: deviceId },
				},
			});
		} catch (error: any) {
			logger.error(error, "An error occured during session delete");
		}
	}
}
