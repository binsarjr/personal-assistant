import { PrismaService } from '@app/prisma';
import { Injectable, type OnModuleInit } from '@nestjs/common';
import { Logger } from '@services/logger';

@Injectable()
export class DeleteSavedMessage implements OnModuleInit {
  logger = Logger({ name: 'DeleteSavedMessage' });
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.deleteIfMoreThanOneDay();
    setInterval(() => {
      this.deleteIfMoreThanOneDay();
    }, 60 * 1_000);
  }

  async deleteIfMoreThanOneDay() {
    const count = await this.prisma.whatsappMessage.count();
    const res = await this.prisma.whatsappMessage.deleteMany({
      where: {
        messageTimeUtc: {
          lt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        },
      },
    });
    this.logger.info(`total saved message: ${count}`);
    this.logger.info(`deleted saved message: ${res.count}`);
  }
}
