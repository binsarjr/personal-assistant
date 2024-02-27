import {
	jidEncode,
	jidNormalizedUser,
	type GroupMetadata,
	type WAMessage,
	type WASocket,
} from "@whiskeysockets/baileys";
import { findPhoneNumbersInText } from "libphonenumber-js";
import NotEligableToProcess from "../../../../errors/NotEligableToProcess.js";
import GroupMessageHandlerAction from "../../../../foundation/actions/GroupMessageHandlerAction.js";
import { QueueMutation } from "../../../../services/queue.js";
import { withSign, withSignRegex } from "../../../../supports/flag.js";
import {
	getContextInfo,
	getJid,
	getMessageCaption,
	getMessageQutoedCaption,
} from "../../../../supports/message.js";
import type { MessagePattern } from "../../../../types/MessagePattern.js";

export default class extends GroupMessageHandlerAction {
	patterns(): MessagePattern {
		return [withSignRegex("add .*"), withSign("add")];
	}

	protected eligableIfBotIsAdmin(socket: WASocket, metadata: GroupMetadata) {
		const me = metadata.participants.find(
			(participant) =>
				jidNormalizedUser(participant.id) === jidNormalizedUser(socket.user?.id)
		);

		if (!me?.admin) throw new NotEligableToProcess();
	}

	async isEligibleToProcess(
		socket: WASocket,
		message: WAMessage
	): Promise<boolean> {
		await super.isEligibleToProcess(socket, message);

		// if (!message.key.fromMe) return false;

		const metadata = await socket.groupMetadata(getJid(message));
		this.eligableIfBotIsAdmin(socket, metadata);
		return true;
	}

	async process(socket: WASocket, message: WAMessage): Promise<void> {
		this.reactToProcessing(socket, message);

		let mentionedJid = getContextInfo(message)?.mentionedJid || [];
		const caption = getMessageCaption(message.message!) || "";
		const quoted = getMessageQutoedCaption(message.message!) || "";
		const phones = findPhoneNumbersInText(caption + " " + quoted, "ID");

		phones.map((phone) => {
			const phoneJid = jidEncode(
				phone.number.number.replace("+", ""),
				"s.whatsapp.net"
			);
			if (!mentionedJid.includes(phoneJid)) {
				mentionedJid.push(phoneJid);
			}
		});

		await QueueMutation.add(async () => {
			await socket.groupParticipantsUpdate(
				getJid(message),
				mentionedJid.filter((jid) => jid != jidNormalizedUser(socket.user?.id)),
				"add"
			);
			await this.reactToDone(socket, message);
		});
	}
}
