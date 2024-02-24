import InstagramDownloaderAction from "../../../actions/message/downloader/InstagramDownloaderAction.js";
import TiktokDownloaderAction from "../../../actions/message/downloader/TiktokDownloaderAction.js";
import type BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";

export default <BaseMessageHandlerAction[]>[
	new TiktokDownloaderAction(),
	new InstagramDownloaderAction(),
];
