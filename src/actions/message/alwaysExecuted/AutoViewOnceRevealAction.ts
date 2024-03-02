import {
  downloadMediaMessage,
  jidNormalizedUser,
  type AnyMessageContent,
  type WAMessage,
  type WASocket,
} from "@whiskeysockets/baileys";
import BaseMessageHandlerAction from "../../../foundation/actions/BaseMessageHandlerAction.js";
import { QueueMessage } from "../../../services/queue.js";
import { sendWithTyping } from "../../../supports/message.js";
import type { MessagePattern } from "../../../types/MessagePattern.js";

export default class extends BaseMessageHandlerAction {
  patterns(): MessagePattern {
    return true;
  }

  async isEligibleToProcess(
    socket: WASocket,
    message: WAMessage,
  ): Promise<boolean> {
    return !message.key.fromMe;
  }

  async process(socket: WASocket, message: WAMessage): Promise<void> {
    const viewOnceMessage =
      message.message?.viewOnceMessage ||
      message.message?.viewOnceMessageV2 ||
      message.message?.viewOnceMessageV2Extension ||
      message;

    const isViewOnce =
      viewOnceMessage?.message?.imageMessage?.viewOnce ||
      viewOnceMessage?.message?.videoMessage?.viewOnce;

    if (isViewOnce) {
      const image = viewOnceMessage?.message?.imageMessage;
      const video = viewOnceMessage?.message?.videoMessage;
      const caption = image?.caption || video?.caption;

      const media = await downloadMediaMessage(message, "buffer", {});

      let content: AnyMessageContent | null = null;

      if (image) {
        content = {
          image: media as Buffer,
        };
      } else if (video) {
        content = {
          video: media as Buffer,
        };
      }

      if (content && caption) {
        content.caption = caption;
      }

      if (content)
        QueueMessage.add(() =>
          sendWithTyping(
            socket,
            content!,
            jidNormalizedUser(socket.user?.id!),
            { quoted: message },
          ),
        );
    }
  }
}
