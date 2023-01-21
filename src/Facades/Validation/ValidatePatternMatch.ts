import { ValidateError } from '../../Exceptions'
import { validatePattern } from '../../utils'

/**
 * Memeriksa apakah inputan string cocok dengan satu dari pola-pola yang
 * disediakan.
 * Fungsi ini menggunakan loop untuk memeriksa satu per satu pola yang
 * disediakan dan menghasilkan true jika salah satu cocok.
 * 
 * @param text - inputan string yang akan dicek.
 * @param patterns - daftar pola atau reguler expression yang digunakan untuk
 * memeriksa.
 * @throws ValidateError jika tidak ada pola yang cocok dengan inputan.
 */
export const validatePatternMatch = (
  text: string,
  patterns: (string | RegExp) | (string | RegExp)[],
) => {
  let isMatch = false
  if (Array.isArray(patterns)) {
    for (const pattern of patterns) {
      isMatch = validatePattern(pattern, text)
      if (isMatch) break
    }
  } else {
    isMatch = validatePattern(patterns, text)
  }

  if (!isMatch)
    throw new ValidateError(
      'Proses dihentikan sampai sini karena tidak ada pattern yang sesuai',
    )
}
