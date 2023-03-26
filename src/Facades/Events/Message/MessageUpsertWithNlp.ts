import { MessageUpsert } from './MessageUpsert'

export abstract class MessageUpsertWithNlp extends MessageUpsert {
  abstract expectIntent: string
  expectMinScore: number = 0.9
  results: { [i: string]: number } = {}
}
