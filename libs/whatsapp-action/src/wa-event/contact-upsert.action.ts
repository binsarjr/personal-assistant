import { PrismaService } from '@app/prisma';
import { WAEvent } from '@app/whatsapp/decorators/wa-event.decorator';
import { Injectable } from '@nestjs/common';
import type { WASocket } from '@whiskeysockets/baileys';

@Injectable()
export class ContactUpsertAction {
  constructor(private readonly prisma: PrismaService) {}
  @WAEvent('contacts.upsert')
  async execute(socket: WASocket, data: { id: string; name: string }[]) {
    for (const contact of data) {
      await this.prisma.whatsappContact.upsert({
        where: { id: contact.id },
        update: { name: contact.name },
        create: { id: contact.id, name: contact.name },
      });

      console.log('Contact upserted', contact);
    }
  }
}
