import GeminiChatAction from "../../../actions/message/gemini/GeminiChatAction.js";
import ResetGeminiChatAction from "../../../actions/message/gemini/ResetGeminiChatAction.js";
import RuleGeminiChatAction from "../../../actions/message/gemini/RuleGeminiChatAction.js";
import SetGeminiChatAction from "../../../actions/message/gemini/SetGeminiChatAction.js";
import SetRuleGeminiChatAction from "../../../actions/message/gemini/SetRuleGeminiChatAction.js";
import type BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";

export default <BaseMessageHandlerAction[]>[
	new SetGeminiChatAction(),
	new SetRuleGeminiChatAction(),
	new RuleGeminiChatAction(),
	new GeminiChatAction(),
	new ResetGeminiChatAction(),
];
