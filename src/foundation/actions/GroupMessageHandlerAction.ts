import {
	isJidGroup,
	type WAMessage,
	type WASocket,
} from "@whiskeysockets/baileys";
import { getJid } from "../../supports/message.js";
import BaseMessageHandlerAction from "./BaseMessageHandlerAction.js";

export default abstract class extends BaseMessageHandlerAction {
	public async isEligibleToProcess(
		socket: WASocket,
		message: WAMessage
	): Promise<boolean> {
		return (
			!!isJidGroup(getJid(message)) &&
			super.isEligibleToProcess(socket, message)
		);
	}
}
