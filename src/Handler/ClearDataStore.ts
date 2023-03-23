import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import { HandlerArgs } from '../Contracts/IEventListener'
import { MessageUpsert } from '../Facades/Events/Message/MessageUpsert'
import Queue from '../Facades/Queue'
import { WhatsappClient } from '../Facades/WhatsappClient'
import { sendMessageWTyping } from '../utils'

export class ClearDataStore extends MessageUpsert {
  constructor(private client: WhatsappClient) {
    super()
  }
  fromMe: boolean = true
  onlyMe: boolean = true
  patterns: string | false | RegExp | (string | RegExp)[] = ['/cleardb']
  async handler({
    props,
    socket,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): Promise<void> {
    await this.client.clearDataStore()
    const jid = props.message.key.remoteJid || ''
    Queue(() =>
      sendMessageWTyping(
        {
          text: 'Done',
        },
        jid,
        socket,
        {
          quoted: props.message!,
        },
      ),
    )
  }
}
