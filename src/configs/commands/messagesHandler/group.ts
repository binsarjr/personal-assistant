import MentionAdminAction from "../../../actions/message/group/MentionAdminAction.js";
import MentionAllAction from "../../../actions/message/group/MentionAllAction.js";
import MentionMemberAction from "../../../actions/message/group/MentionMemberAction.js";
import type BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";

export default <BaseMessageHandlerAction[]>[
	new MentionAdminAction(),
	new MentionAllAction(),
	new MentionMemberAction(),
];
