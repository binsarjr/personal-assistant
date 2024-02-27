import {
	jidNormalizedUser,
	type GroupMetadata,
	type WAMessage,
	type WASocket,
} from "@whiskeysockets/baileys";
import NotEligableToProcess from "../../../../errors/NotEligableToProcess.js";
import GroupMessageHandlerAction from "../../../../foundation/actions/GroupMessageHandlerAction.js";
import { QueueMutation } from "../../../../services/queue.js";
import { withSignRegex } from "../../../../supports/flag.js";
import { getContextInfo, getJid } from "../../../../supports/message.js";
import type { MessagePattern } from "../../../../types/MessagePattern.js";

export default class extends GroupMessageHandlerAction {
	patterns(): MessagePattern {
		return withSignRegex("promote .*");
	}

	protected eligableIfBotIsAdmin(socket: WASocket, metadata: GroupMetadata) {
		const me = metadata.participants.find(
			(participant) =>
				jidNormalizedUser(participant.id) === jidNormalizedUser(socket.user?.id)
		);

		if (!me?.admin) throw new NotEligableToProcess();
	}

	protected eligableIfRequestFromUserAdmin(
		metadata: GroupMetadata,
		message: WAMessage
	) {
		const user_requested = metadata.participants.find(
			(participant) =>
				jidNormalizedUser(participant.id) ===
				jidNormalizedUser(message.key.participant || "")
		);

		if (!user_requested?.admin) throw new NotEligableToProcess();
	}

	async isEligibleToProcess(
		socket: WASocket,
		message: WAMessage
	): Promise<boolean> {
		await super.isEligibleToProcess(socket, message);

		const metadata = await socket.groupMetadata(getJid(message));
		this.eligableIfBotIsAdmin(socket, metadata);
		this.eligableIfRequestFromUserAdmin(metadata, message);
		return true;
	}

	async process(socket: WASocket, message: WAMessage): Promise<void> {
		this.reactToProcessing(socket, message);

		const mentionedJid = getContextInfo(message)?.mentionedJid || [];

		await QueueMutation.add(async () => {
			await socket.groupParticipantsUpdate(
				getJid(message),
				mentionedJid.filter((jid) => jid != jidNormalizedUser(socket.user?.id)),
				"promote"
			);
			await this.reactToDone(socket, message);
		});
	}
}
