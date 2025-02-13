export type TextMatchType =
  | 'equals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'regex';

export const textEventStore = new Map<
  string,
  Array<{
    method: Function;
    priority: number;
    parameters: { [key: string]: 'socket' | 'baileys-context' };
    matchType: TextMatchType;
    classRef: any;
  }>
>();
