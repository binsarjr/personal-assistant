import {
	isJidGroup,
	type WAMessage,
	type WASocket,
} from "@whiskeysockets/baileys";
import NotEligableToProcess from "../../errors/NotEligableToProcess.js";
import { getJid } from "../../supports/message.js";
import BaseMessageHandlerAction from "./BaseMessageHandlerAction.js";

export default abstract class extends BaseMessageHandlerAction {
	public async isEligibleToProcess(
		socket: WASocket,
		message: WAMessage
	): Promise<boolean> {
		if (!(await super.isEligibleToProcess(socket, message)))
			throw new NotEligableToProcess();

		if (!isJidGroup(getJid(message))) throw new NotEligableToProcess();

		return true;
	}
}
