import { GroupParticipant } from '@whiskeysockets/baileys'
import { ValidateError } from '../../Exceptions'
/**
 * Periksa apakah partisipan dalam kelompok memiliki hak akses yang tepat.
 * Jika handler.groupAccess bernilai 'all', maka tidak perlu melakukan
 * pengecekan.
 * Jika handler.groupAccess bernilai 'admin', maka partisipan harus memiliki
 * admin == true.
 * Jika handler.groupAccess bernilai 'member', maka partisipan harus memiliki
 * admin == false.
 */
export const ValidateGroupAccess = (
  groupAccess: 'admin' | 'member' | 'all',
  participantCheck: string,
  participantList: GroupParticipant[],
) => {
  if (groupAccess === 'all') return
  if (groupAccess === 'admin') {
    if (!participantList.find((p) => p.id == participantCheck && !!p.admin)) {
      throw new ValidateError(
        'Proses tidak bisa dilanjutkan karena proses ini hanya bisa digunakan oleh admin group',
      )
    }
  } else if (groupAccess === 'member') {
    if (!participantList.find((p) => p.id == participantCheck && !p.admin)) {
      throw new ValidateError(
        'Proses tidak bisa dilanjutkan karena proses ini hanya bisa digunakan oleh admin member',
      )
    }
  }
}
