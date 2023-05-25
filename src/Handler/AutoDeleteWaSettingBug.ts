import { MessageUpsertType, proto } from "@whiskeysockets/baileys"
import { HandlerArgs } from "../Contracts/IEventListener"
import { MessageUpsert } from "../Facades/Events/Message/MessageUpsert"

export class AutoDeleteWaSettingBug extends MessageUpsert {
    patterns: RegExp = /wa\.me\/{1,}settings/ig
    fromMe: boolean = true
    async handler({ socket, props }: HandlerArgs<{ message: proto.IWebMessageInfo; type: MessageUpsertType }>): Promise<void> {
        const jid = props.message.key.remoteJid || ''
        try {
            await socket.sendMessage(jid, {
                delete: props.message.key
            })
        } catch (error) {

        }

        try {
            const message: { id: string, fromMe: boolean, timestamp: any } = {
                id: props.message.key.id!,
                fromMe: props.message.key.fromMe!,
                timestamp: props.message.messageTimestamp

            }
            await socket.chatModify({ clear: { messages: [message] } },
                jid)
        } catch (error) {

        }

    }

}