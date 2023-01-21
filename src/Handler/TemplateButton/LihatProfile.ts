import { MessageUpsertType, proto } from '@adiwajshing/baileys'
import { HandlerArgs } from '../../Contracts/IEventListener'
import { MessageUpsert } from '../../Facades/Events/Message/MessageUpsert'
import { MessageUpsertButtonResponse } from '../../Facades/Events/Message/MessageUpsertButtonResponse'
import { sendProfile } from '../../Lib/sendProfile'

export class LihatProfileTemplateButton extends MessageUpsertButtonResponse {
  selectedId: string = 'lihat-profil'
  handler({
    socket,
    props,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): void | Promise<void> {
    const jid = props.message.key.remoteJid || ''
    sendProfile(jid, socket)
  }
}

export class LihatProfile extends MessageUpsert {
  patterns: string | false | RegExp | (string | RegExp)[] = [
    '.profil',
    '.profile',
  ]
  chat: 'all' | 'group' | 'user' = 'user'
  handler({
    props,
    socket,
  }: HandlerArgs<{
    message: proto.IWebMessageInfo
    type: MessageUpsertType
  }>): void | Promise<void> {
    const jid = props.message.key.remoteJid || ''
    sendProfile(jid, socket)
  }
}
