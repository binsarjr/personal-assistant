import { MessageUpsertType, WAMessage } from '@whiskeysockets/baileys'
import { ChatType } from '../../../Contracts/ChatType'
import { MessageEvent } from '../../../Contracts/Events/MessageEvent'
import { HandlerArgs } from '../../../Contracts/IEventListener'

 /**
  * Kelas abstrak MessageUpsertListResponse merupakan turunan dari MessageEvent.
  * Kelas ini menyediakan fitur untuk mengatur handler message.
  * 
  * @property selectedId - id dari message yang dipilih.
  * @property type - tipe manajemen message yang digunakan. Tipe ini bisa berupa
  * 'all' atau MessageUpsertType.
  * @property chat - tipe chat yang akan dihandle. Nilai ini bisa bervariasi
  * antara 'all' atau ChatType.
  * @property groupAccess - tipe akses grup yang digunakan. Nilai ini bisa
  * bervariasi antara 'admin', 'member', atau 'all'.
  * 
  * @method handler() - method yang akan dijalankan ketika message diterima.
  * Argumen dalam handler ini berupa objek dengan properties message dan type.
  */

export abstract class MessageUpsertListResponse extends MessageEvent {
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
