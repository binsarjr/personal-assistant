import { createMiddleware } from "$core/decorators/command-middleware";
import { isJidGroup } from "@whiskeysockets/baileys";

export const IsGroupChatMiddleware = createMiddleware(async (socket, ctx) => {
	return !!isJidGroup(ctx.key.remoteJid!);
});
