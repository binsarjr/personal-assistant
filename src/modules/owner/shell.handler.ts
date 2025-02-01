import { Command, Socket } from "$core/decorators";
import { CommandMiddleware } from "$core/decorators/command-middleware";
import { IsOnlyMeMiddleware } from "$infrastructure/whatsapp/middlewares/is-me.middleware";
import type { SocketClient } from "$infrastructure/whatsapp/types";
import { getMessageCaption } from "$support/whatsapp.support";
import type { WAMessage } from "@whiskeysockets/baileys";
import { $ } from "bun";

export class ShellHandler {
	@Command(/^\$.*/)
	@CommandMiddleware(IsOnlyMeMiddleware)
	async shell(@Socket() socket: SocketClient, message: WAMessage) {
		const caption = getMessageCaption(message.message!).replace(
			/^\$(\s+)?/,
			""
		);

		const { stdout, stderr } = await $`${{ raw: caption }}`;

		if (stderr) {
			await socket.replyQuote({
				text: stderr.toString().trim(),
			});
		}

		if (stdout) {
			await socket.replyQuote({
				text: stdout.toString().trim(),
			});
		}
	}
}
