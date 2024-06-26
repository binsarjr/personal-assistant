import { PrismaService } from '@app/prisma';
import { WAEvent } from '@app/whatsapp/decorators/wa-event.decorator';
import { Injectable, OnModuleInit } from '@nestjs/common';
import type { WASocket } from '@whiskeysockets/baileys';

@Injectable()
export class ContactUpsertAction implements OnModuleInit {
  private loaded = false;
  constructor(private readonly prisma: PrismaService) {}
  onModuleInit() {
    this.loaded = true;
  }
  @WAEvent('contacts.upsert')
  async execute(socket: WASocket, data: { id: string; name: string }[]) {
    if (!this.loaded) return;
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
