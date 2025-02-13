import { OnText } from '$baileys-decorators/decorators/on-text.decorator';

export class HelloWorldAction {
  getHello() {
    return 'Hello World';
  }
  @OnText('wkwkkwk')
  async execute() {
    console.log(this.getHello());
  }
}
