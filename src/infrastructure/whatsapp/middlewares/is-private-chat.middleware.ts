import { createMiddleware } from "$core/decorators/command-middleware";
import { isJidGroup, isJidUser } from "@whiskeysockets/baileys";

export const IsPrivateChatMiddleware = createMiddleware(async (socket, ctx) => {
	return !!isJidUser(ctx.key.remoteJid!) && !isJidGroup(ctx.key.remoteJid!);
});
