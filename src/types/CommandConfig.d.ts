import type BaseMessageHandlerAction from "../foundation/actions/BaseMessageHandlerAction.ts";

export default interface CommandConfig {
	messagesHandler: BaseMessageHandlerAction[];
}
