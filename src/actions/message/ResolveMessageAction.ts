import type { BaileysEventMap, WASocket } from "@whiskeysockets/baileys";
import { commands } from "../../configs/command.js";
import { patternsAndTextIsMatch } from "../../supports/flag.js";
import { getMessageCaption } from "../../supports/message.js";

export default class {
	static execute(
		socket: WASocket,
		messages: BaileysEventMap["messages.upsert"]
	) {
		for (const message of messages.messages) {
			for (const handler of commands.messagesHandler) {
				if (
					patternsAndTextIsMatch(
						handler.patterns(),
						getMessageCaption(message.message!)
					)
				) {
					handler.execute(socket, message);
				}
			}
		}
	}
}
