import type CommandConfig from "../types/CommandConfig.js";
import alwaysExecuted from "./commands/messagesHandler/alwaysExecuted.js";
import group from "./commands/messagesHandler/group.js";
import random from "./commands/messagesHandler/random.js";

export const commands: CommandConfig = {
	messagesHandler: [...group, ...random, ...alwaysExecuted],
};
