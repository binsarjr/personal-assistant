import AutoRevealDeletedMessageAction from "../../../actions/message/alwaysExecuted/AutoRevealDeletedMessageAction.js";
import AutoViewOnceRevealAction from "../../../actions/message/alwaysExecuted/AutoViewOnceRevealAction.js";
import type BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";

export default <BaseMessageHandlerAction[]>[
	new AutoViewOnceRevealAction(),
	// new AutoCheckApkAction(),
	new AutoRevealDeletedMessageAction(),
	// new AnswerThankAction(),
	// new AnswerGreetingOnlyAction(),
];
