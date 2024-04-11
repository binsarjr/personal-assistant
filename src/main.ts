import { NestFactory } from '@nestjs/core';
import * as inquirer from 'inquirer';
import { WhatsappActionModule } from '../libs/whatsapp-action/src';
import { ScanQrCodeAction } from '../libs/whatsapp-action/src/scan-qr-code.action';
import { WhatsappConnectionService } from '../libs/whatsapp/src/core/whatsapp-connection.service';
import { AppModule } from './app.module';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  // await app.listen(3000);
  // await CommandFactory.run(AppModule);

  if (process.argv.includes('--login')) {
    const inputs = await inquirer.prompt([
      {
        type: 'input',
        name: 'deviceName',
        message: 'What is your device name?',
      },
    ]);
    if (!inputs.deviceName) {
      console.error('Device name is required');
      return;
    }

    const loginApp = await NestFactory.createApplicationContext(AppModule);

    const service = loginApp.select(WhatsappActionModule).get(ScanQrCodeAction);
    await service.scan(inputs.deviceName);

    await loginApp.close();
    return;
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  const whatsappConnection = app.get(WhatsappConnectionService);
  whatsappConnection.connectingAllDevice();

  await app.close();
}

bootstrap();
