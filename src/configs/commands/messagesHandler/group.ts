import MentionAdminAction from "../../../actions/message/group/MentionAdminAction.js";
import MentionAllAction from "../../../actions/message/group/MentionAllAction.js";
import MentionMemberAction from "../../../actions/message/group/MentionMemberAction.js";
import AddMemberAction from "../../../actions/message/group/mutation/AddMemberAction.js";
import DemoteMemberAction from "../../../actions/message/group/mutation/DemoteMemberAction.js";
import KickMemberAction from "../../../actions/message/group/mutation/KickMemberAction.js";
import PromoteMemberAction from "../../../actions/message/group/mutation/PromoteMemberAction.js";
import type BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";

export default <BaseMessageHandlerAction[]>[
	new MentionAdminAction(),
	new MentionAllAction(),
	new MentionMemberAction(),

	new PromoteMemberAction(),
	new DemoteMemberAction(),
	new KickMemberAction(),
	new AddMemberAction(),
];
