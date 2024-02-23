import HelloWorldAction from "../actions/message/HelloWorldAction.js";
import type CommandConfig from "../types/CommandConfig.js";

export const commands: CommandConfig = {
	messagesHandler: [new HelloWorldAction()],
};
