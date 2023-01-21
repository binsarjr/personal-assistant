import { GroupParticipant, WASocket } from '@adiwajshing/baileys'
import { ValidateError } from '../../../Exceptions'

export const throwIfIamNotAdmin = (
  socket: WASocket,
  jid: string,
  participants: GroupParticipant[],
) => {
  if (
    !participants.find(
      (participant) => participant.id == socket.user?.id && !!participant.admin,
    )
  ) {
    throw new ValidateError('Saya bukan admin makanya proses ini saya skip')
  }
}
