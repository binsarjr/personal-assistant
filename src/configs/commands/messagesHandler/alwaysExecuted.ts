import AnswerThankAction from "../../../actions/message/alwaysExecuted/AnswerThankAction.js";
import AutoViewOnceRevealAction from "../../../actions/message/alwaysExecuted/AutoViewOnceRevealAction.js";
import type BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";

export default <BaseMessageHandlerAction[]>[
	new AutoViewOnceRevealAction(),
	new AnswerThankAction(),
];