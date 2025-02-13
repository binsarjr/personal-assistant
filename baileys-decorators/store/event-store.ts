export const eventStore = new Map<
  string,
  Array<{
    method: Function;
    priority: number;
    parameters: { [key: string]: 'socket' | 'baileys-context' };
  }>
>();
