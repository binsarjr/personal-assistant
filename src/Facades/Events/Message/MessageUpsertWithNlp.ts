import { MessageUpsert } from './MessageUpsert'

export abstract class MessageUpsertWithNlp extends MessageUpsert {
  abstract intent: string
  abstract score: number
  public data: any
}
