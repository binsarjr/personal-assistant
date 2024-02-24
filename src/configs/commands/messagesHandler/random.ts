import InfoServerAction from "../../../actions/message/random/InfoServerAction.js";
import PingAction from "../../../actions/message/random/PingAction.js";
import type BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";

export default <BaseMessageHandlerAction[]>[
	new PingAction(),
	new InfoServerAction(),
];
