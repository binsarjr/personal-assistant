import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'cowsay',
  options: {
    isDefault: true,
  },
})
export class QrcodeConnectionCommand extends CommandRunner {
  async run() {
    console.log('Hello World!');
  }
}
