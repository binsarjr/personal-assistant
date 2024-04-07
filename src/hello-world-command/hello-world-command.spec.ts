import { HelloWorldCommand } from './hello-world-command';

describe('HelloWorldCommand', () => {
  it('should be defined', () => {
    expect(new HelloWorldCommand()).toBeDefined();
  });
});
