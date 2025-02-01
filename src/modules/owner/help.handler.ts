import { Command, Socket } from "$core/decorators";
import type { SocketClient } from "$infrastructure/whatsapp/types";
import { replaceRandomSpacesToUnicode } from "$support/string.support";

export class HelpHandler {
	@Command(/^.(help|menu)$/i)
	async help(@Socket() socket: SocketClient) {
		const text = `

*Commands:*
- .ping
- .help
- .menu

*Owner Commands:*
- $ (command)

`.trim();
		await socket.replyQuote({
			text: replaceRandomSpacesToUnicode(text),
		});
	}
}
