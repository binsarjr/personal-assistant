import { ValidateError } from '../../Exceptions'

/**
 * Pengecekan apakah peserta ada dalam daftar peserta.
 * Jika peserta ada dalam daftar, perintah dilanjutkan.
 */
export const ValidateParticipantsAllowed = (
  participantCheck: string,
  participantsAllowed: string[],
) => {
  if (!participantsAllowed.includes(participantCheck))
  
    throw new ValidateError(
      'Participant tidak dijijnkan melanjutkan proses ini',
    )
}
