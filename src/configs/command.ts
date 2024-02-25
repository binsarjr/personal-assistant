import type CommandConfig from "../types/CommandConfig.js";
import alwaysExecuted from "./commands/messagesHandler/alwaysExecuted.js";
import downloader from "./commands/messagesHandler/downloader.js";
import gemini from "./commands/messagesHandler/gemini.js";
import group from "./commands/messagesHandler/group.js";
import random from "./commands/messagesHandler/random.js";

export const commands: CommandConfig = {
	messagesHandler: [
		...group,
		...random,
		...alwaysExecuted,
		...downloader,
		...gemini,
	],
};
