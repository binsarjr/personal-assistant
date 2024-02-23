import PingAction from "../actions/message/random/PingAction.js";
import type CommandConfig from "../types/CommandConfig.js";

export const commands: CommandConfig = {
	messagesHandler: [new PingAction()],
};
