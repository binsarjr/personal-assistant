import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'hello-world',
})
export class HelloWorldCommand extends CommandRunner {
  async run() {
    console.log('Hello World! guys');
  }
}
