import PingAction from "../../../actions/message/random/PingAction.js";
import ResolveToHdAction from "../../../actions/message/random/ResolveToHdAction.js";
import SticketMakerAction from "../../../actions/message/random/SticketMakerAction.js";
import SticketToImageAction from "../../../actions/message/random/SticketToImageAction.js";
import type BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";

export default <BaseMessageHandlerAction[]>[
	new PingAction(),
	new ResolveToHdAction(),
	new SticketMakerAction(),
	new SticketToImageAction(),
];
