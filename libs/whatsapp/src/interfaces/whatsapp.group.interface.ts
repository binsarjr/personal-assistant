import { WhatsappMessageAction } from '@app/whatsapp/interfaces/whatsapp.interface';
import {
  jidNormalizedUser,
  WAMessage,
  WASocket,
} from '@whiskeysockets/baileys';
import { getJid } from '@app/whatsapp/supports/message.support';
import { LIMITIED_QUEUE } from '@services/queue';
import { IsGroup } from '@app/whatsapp/traits/IsGroup.trait';
import { TraitEligible } from '../../../../src/decorators/trait.decorator';

@TraitEligible(IsGroup)
export abstract class WhatsappGroupAction extends WhatsappMessageAction {
  protected async isAdmin(socket: WASocket, message: WAMessage) {
    const metadata = await LIMITIED_QUEUE.add(() =>
      socket.groupMetadata(getJid(message)),
    );

    const admins = metadata.participants.filter(
      (participant) => !!participant.admin,
    );

    return (
      admins.findIndex(
        (participant) =>
          jidNormalizedUser(participant.id) ===
          jidNormalizedUser(message.key.participant),
      ) > -1
    );
  }
}
