import { BaileysEventMap, WASocket } from '@whiskeysockets/baileys'

export interface HandlerArgs<T> {
  props: T
  socket: WASocket
}

export type IEventHandler<T> = ({}: HandlerArgs<T>) => void | Promise<void>

export type IEventListener<T extends keyof BaileysEventMap> = IEventHandler<
  BaileysEventMap[T]
>
