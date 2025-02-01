import { Command } from "$core/decorators";
import { prisma } from "$infrastructure/database/db";
import { logger } from "$infrastructure/logger/console.logger";
import type { WAMessage } from "@whiskeysockets/baileys";

export class SaveMessageHandler {
	@Command(/.*/)
	async saveMessage(message: WAMessage) {
		logger.info(message, "Saving message");
		const item = await prisma.whatsappMessage.upsert({
			where: {
				jid_messageId: {
					jid: message.key.remoteJid!,
					messageId: message.key.id!,
				},
			},
			update: {
				meta: JSON.stringify(message),
			},
			create: {
				jid: message.key.remoteJid!,
				messageId: message.key.id!,
				messageTimeUtc: new Date(+message.messageTimestamp! * 1000),
				meta: JSON.stringify(message),
			},
		});
		logger.info(item, "Message saved");
	}
}
