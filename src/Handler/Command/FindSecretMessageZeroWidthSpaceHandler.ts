import { MessageUpsertType, proto } from '@whiskeysockets/baileys'
import { HandlerArgs } from '../../Contracts/IEventListener'
import { MessageUpsert } from '../../Facades/Events/Message/MessageUpsert'
import Queue from '../../Facades/Queue'
import { decodeText } from '../../Lib/unicodeStegano'
import { getMessageQutoedCaption, sendMessageWTyping } from '../../utils'

export class FindSecretMessageZeroWidthSpaceHandler extends MessageUpsert {
  fromMe: boolean = true
  onlyMe: boolean = true
  patterns: string | false | RegExp | (string | RegExp)[] = /.findsecret/i
  async handler({
    props,
    socket,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): Promise<void> {
    const quotedText = getMessageQutoedCaption(props.message.message!)
    const findSecret = decodeText(quotedText)
    if (findSecret.hiddenText) {
      Queue(() =>
        sendMessageWTyping(
          {
            text: findSecret.hiddenText,
          },
          props.message.key.remoteJid || '',
          socket,
          {
            quoted: props.message!,
          },
        ),
      )
    } else {
        Queue(() =>
        sendMessageWTyping(
          {
            text: "Tidak ditemukan pesan rahasia (unicode zero width space)",
          },
          props.message.key.remoteJid || '',
          socket,
          {
            quoted: props.message!,
          },
        ),
      )
    }
  }
}
