import * as baileys from "@whiskeysockets/baileys";
import {
	BufferJSON,
	initAuthCreds,
	type AuthenticationCreds,
	type SignalKeyStore,
} from "@whiskeysockets/baileys";
import type WhatsappAuthStore from "../contracts/foundation/WhatsappAuthStore.js";
import DB from "../services/database.js";
import logger from "../services/logger.js";

export default class implements WhatsappAuthStore {
	constructor(public readonly sessionId: string) {}
	async authentication(): Promise<{
		state: { creds: AuthenticationCreds; keys: SignalKeyStore };
		saveCreds: () => Promise<void>;
	}> {
		const creds: AuthenticationCreds =
			(await this.read("creds")) || initAuthCreds();

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
								if (type === "app-state-sync-key" && value) {
									value =
										baileys.proto.Message.AppStateSyncKeyData.fromObject(value);
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
									value ? this.write(value, storeId) : this.removeData(storeId)
								);
							}
						}

						await Promise.all(tasks);
					},
				},
			},
			saveCreds: () => {
				return this.write(creds, "creds");
			},
		};
	}

	async read(type: string) {
		try {
			const data = DB.data.auths[this.sessionId][type];
			if (data === undefined) return null;

			return JSON.parse(data, BufferJSON.reviver);
		} catch (e: any) {
			logger.info("Trying to read non existent session data");
			logger.error(e.toString());
			return null;
		}
	}

	async write(data: any, type: string) {
		try {
			data = JSON.stringify(data, BufferJSON.replacer);
			if (DB.data.auths[this.sessionId] === undefined)
				DB.data.auths[this.sessionId] = {};

			DB.data.auths[this.sessionId][type] = data;
			await DB.write();
		} catch (e: any) {
			logger.error(e.toString(), "An error occured during session delete");
		}
	}

	async removeData(type: string) {
		try {
			DB.data.auths[this.sessionId][type] = undefined;
			delete DB.data.auths[this.sessionId][type];
		} catch (error: any) {
			logger.error(error.toString(), "An error occured during session delete");
		}
	}
}
