import {
	getContentType,
	isJidGroup,
	isJidUser,
	jidNormalizedUser,
	proto,
} from "@whiskeysockets/baileys";
import { ChatType } from "../../Contracts/ChatType";
import { ValidateError } from "../../Exceptions";

/**
 * Memeriksa apakah jid dimasukkan adalah Jid grup atau Jid user berdasarkan
 * pengaturan.
 * Jika handler.chat adalah 'all' maka tidak perlu memeriksa.
 * Jika handler.chat adalah 'group' maka memeriksa apakah jid adalah jid grup.
 * Jika handler.chat adalah 'user' maka memeriksa apakah jid adalah jid user.
 *
 */
export const ValidateChatAccess = (
	jid: string,
	chat: ChatType,
	message: proto.IMessage,
	participantId: string
) => {
	participantId = jidNormalizedUser(participantId);
	if (chat !== "all") {
		if (chat === "group") {
			if (!isJidGroup(jid))
				throw new ValidateError("Proses hanya bisa digunakan oleh chat grup");
		} else if (chat === "user") {
			if (!isJidUser(jid))
				throw new ValidateError(
					"Proses hanya bisa digunakan oleh chat user/personal"
				);
		} else if (chat == "mention") {
			// skip if is in private chat.because mention it mean work on personal chat
			// and group mentioned
			console.log(isJidUser(jid), "jiduser");
			if (isJidUser(jid)) return;
			const type = getContentType(message)!;
			const msg =
				type == "viewOnceMessage"
					? message[type]!.message![getContentType(message[type]!.message!)!]
					: message[type];
			const mentions =
				message?.extendedTextMessage?.contextInfo?.mentionedJid ||
				(msg as proto.IMessage)?.extendedTextMessage?.contextInfo
					?.mentionedJid ||
				(msg as proto.Message.IExtendedTextMessage)?.contextInfo
					?.mentionedJid ||
				[];
			if (!mentions.includes(participantId)) {
				throw new ValidateError(
					"Proses hanya bisa digunakan oleh chat pada saat di mention"
				);
			}
		}
	}
};
