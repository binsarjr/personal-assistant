import type { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { react } from '../supports/message.support';

enum Emoji {
  Processing = '⏳',
  Done = '✅',
  Failed = '❌',
  Invalid = '😡',
}

export abstract class WhatsappAction {
  abstract execute(socket: WASocket): Promise<void>;
}

export abstract class WhatsappReactionAction {
  protected async reactToProcessing(socket: WASocket, message: WAMessage) {
    return react(socket, Emoji.Processing, message);
  }

  protected resetReact(socket: WASocket, message: WAMessage) {
    return react(socket, '', message);
  }

  protected reactToDone(socket: WASocket, message: WAMessage) {
    return react(socket, Emoji.Done, message);
  }

  protected reactToFailed(socket: WASocket, message: WAMessage) {
    return react(socket, Emoji.Failed, message);
  }

  protected reactToInvalid(socket: WASocket, message: WAMessage) {
    return react(socket, Emoji.Invalid, message);
  }
}

export abstract class WhatsappMessageAction extends WhatsappReactionAction {
  abstract execute(socket: WASocket, message: WAMessage): Promise<void>;
}
