import { isJidGroup, isJidUser } from '@adiwajshing/baileys'
import { ValidateError } from '../../Exceptions'

/**
 * Memeriksa apakah jid dimasukkan adalah Jid grup atau Jid user berdasarkan
 * pengaturan.
 * Jika handler.chat adalah 'all' maka tidak perlu memeriksa.
 * Jika handler.chat adalah 'group' maka memeriksa apakah jid adalah jid grup.
 * Jika handler.chat adalah 'user' maka memeriksa apakah jid adalah jid user.
 *
 */
export const ValidateChatAccess = (
  jid: string,
  chat: 'group' | 'user' | 'all',
) => {
  if (chat !== 'all') {
    if (chat === 'group') {
      if (!isJidGroup(jid))
        throw new ValidateError('Proses hanya bisa digunakan oleh chat grup')
    } else if (chat === 'user') {
      if (!isJidUser(jid))
        throw new ValidateError(
          'Proses hanya bisa digunakan oleh chat user/personal',
        )
    }
  }
}
