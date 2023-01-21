import { MessageUpsertType, WAMessage } from '@adiwajshing/baileys'
import { ChatType } from '../../../Contracts/ChatType'
import { MessageEvent } from '../../../Contracts/Events/MessageEvent'
import { HandlerArgs } from '../../../Contracts/IEventListener'


/**
 * Kelas untuk memberikan respons dari button upsert.
 * 
 * @prop selectedId - id yang dipilih.
 * @prop type - tipe message, 'all' untuk semua message.
 * @prop chat - tipe chat, 'all' untuk semua chat.
 * @prop groupAccess - jika tipe chat adalah sebuah grup, maka ini adalah access
 * yang diperbolehkan 'admin' hanya untuk admin saja, 'member' untuk member saja dan
 * 'all' untuk semua.
 * @method handler - method untuk handle button response.
 */
export abstract class MessageUpsertButtonResponse extends MessageEvent {
  abstract selectedId: string
  type: MessageUpsertType | 'all' = 'all'
  /**
   * Memberikan settingan bahwa message akan dihandler untuk
   * all - semua
   * user - chat personal user saja
   * group - group chat
   */
  chat: ChatType = 'all'
  /**
   * Untuk mengecek ketika chat adalah sebuah grup.
   * lanjutkan proses sesuai dengan setttingan grup access
   * all untuk semua
   * admin untuk admin saja member tidak bisa mengakses ini
   * member hanya untuk member saja admin tidak bisa
   */
  groupAccess: 'admin' | 'member' | 'all' = 'all'
  abstract handler({}: HandlerArgs<{
    message: WAMessage
    type: MessageUpsertType
  }>): void | Promise<void>
}
