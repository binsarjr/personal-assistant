import { MessageUpsertType, proto } from "@whiskeysockets/baileys"
import { HandlerArgs } from "../Contracts/IEventListener"
import { MessageUpsert } from "../Facades/Events/Message/MessageUpsert"
import Queue from "../Facades/Queue"

export class AutoDeleteWaSettingBug extends MessageUpsert {
    patterns: RegExp = /wa\.me\/settings/ig
    fromMe: boolean = true
    async handler({ socket, props }: HandlerArgs<{ message: proto.IWebMessageInfo; type: MessageUpsertType }>): Promise<void> {
        const jid = props.message.key.remoteJid || ''
        Queue(() => socket.sendMessage(jid, {
            delete: props.message.key
        }))

        const message: { id: string, fromMe: boolean, timestamp: number } = {
            id: props.message.key.id!,
            fromMe: props.message.key.fromMe!,
            timestamp: props.message.messageTimestamp

        }
        Queue(() => socket.chatModify({ clear: { messages: [message] } },
            jid))
    }

}