import { Injectable, type OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { Logger } from '@src/services/logger';

type PrismaOption = PrismaClient<Prisma.PrismaClientOptions, never>;

export type PrismaModel = keyof Omit<
  PrismaOption,
  | '$connect'
  | '$disconnect'
  | '$executeRaw'
  | '$executeRawUnsafe'
  | '$on'
  | '$queryRaw'
  | '$queryRawUnsafe'
  | '$transaction'
  | '$use'
  | '$extends'
  | symbol
>;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private logger = Logger({ name: 'PrismaService' });
  async onModuleInit() {
    this.logger.info('PrismaService initialized');
    await this.$connect();
  }
}
