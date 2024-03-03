import type { BaileysEventMap, WASocket } from "@whiskeysockets/baileys";
import { commands } from "../../configs/command.js";
import DB from "../../services/database.js";
import { Queue } from "../../services/queue.js";
import { patternsAndTextIsMatch } from "../../supports/flag.js";
import { getMessageCaption } from "../../supports/message.js";

export default class {
	execute(socket: WASocket, messages: BaileysEventMap["messages.upsert"]) {
		this.removeGeminiIfMoreThen10Seconds();
		for (const message of messages.messages) {
			if (this.checkIsGeminiKey(message?.key?.id || "")) {
				continue;
			}
			for (const handler of commands.messagesHandler) {
				if (
					patternsAndTextIsMatch(
						handler.patterns(),
						getMessageCaption(message.message!)
					)
				) {
					Queue.add(() => handler.execute(socket, message));
				}
			}
		}
	}

	removeGeminiIfMoreThen10Seconds() {
		const keys = Object.keys(DB.data.geminiMessageResponseIds || {});
		for (const key of keys) {
			if (Date.now() - DB.data.geminiMessageResponseIds[key] > 10_000) {
				delete DB.data.geminiMessageResponseIds[key];
			}
		}
	}

	checkIsGeminiKey(key: string) {
		return (
			DB.data.geminiMessageResponseIds &&
			!!DB.data.geminiMessageResponseIds[key]
		);
	}
}
