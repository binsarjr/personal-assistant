import { WhatsappActionModule } from '@app/whatsapp-action';
import { ScanQrCodeAction } from '@app/whatsapp-action/scan-qr-code.action';
import { WhatsappConnectionService } from '@app/whatsapp/core/whatsapp-connection.service';
import { WhatsappModule } from '@app/whatsapp/whatsapp.module';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaModule, PrismaService } from '@app/prisma';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const prisma = app.select(PrismaModule.forRoot()).get(PrismaService);
  await prisma.$connect();

  const devices = await prisma.device.findMany();
  if (devices.length === 0) {
    const service = app.select(WhatsappActionModule).get(ScanQrCodeAction);
    await service.scan('personal-asistant');
  } else {
    const whatsappConnection = app
      .select(WhatsappModule.forRoot())
      .get(WhatsappConnectionService);
    await whatsappConnection.connectingAllDevice();
  }

  await app.close();
}

bootstrap()
  .then(() => {
    console.log('Bootstrap done');
  })
  .catch((e) => {
    console.error(e);
  });
