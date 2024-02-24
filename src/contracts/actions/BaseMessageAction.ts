import type { WAMessage, WASocket } from "@whiskeysockets/baileys";

export default interface BaseMessageAction {
	execute: (socket: WASocket, message: WAMessage) => Promise<void>;
}
