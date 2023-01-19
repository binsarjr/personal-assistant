import { ValidateError } from '../../Exceptions'
import { validatePattern } from '../../utils'
/**
 * Mendapatkan potongan pesan dan melakukan validasi pola yang diberikan.
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
