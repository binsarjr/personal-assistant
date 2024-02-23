import type { WAMessage, WASocket } from "@whiskeysockets/baileys";
import BaseMessageHandlerAction from "./BaseMessageHandlerAction.js";

export default abstract class extends BaseMessageHandlerAction {
	public async isEligibleToProcess(
		socket: WASocket,
		message: WAMessage
	): Promise<boolean> {
		return super.isEligibleToProcess(socket, message);
	}
}
