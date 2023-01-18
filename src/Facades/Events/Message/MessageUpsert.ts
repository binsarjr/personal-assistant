import { MessageUpsertType, WAMessage } from '@adiwajshing/baileys'
import { MessageEvent } from '../../../Contracts/Events/MessageEvent'
import { HandlerArgs } from '../../../Contracts/IEventListener'
import { Pattern } from '../../../Contracts/Pattern'

/**
 * Kelas abstrak MessageUpsert exteds MessageEvent  dan implements Pattern
 * patterns: menentukan jenis ekspresi reguler atau string.
 * type: tipe MessageUpsert dapat berupa "all".
 * handler() : menerima parameter berupa objek HandlerArgs dan berisi atribut
 * message dan type WAMessage
 */
export abstract class MessageUpsert extends MessageEvent implements Pattern {
  patterns: false | (string | RegExp) | (string | RegExp)[] = false
  type: MessageUpsertType | 'all' = 'all'
  /**
   * Memberikan settingan bahwa message akan dihandler untuk
   * all - semua
   * user - chat personal user saja
   * group - group chat
   */
  chat: 'group' | 'user' | 'all' = 'all'
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
