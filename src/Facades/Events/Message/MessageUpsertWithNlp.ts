import { NlpResponse } from '../../../nlp/nlpProcess'
import { MessageUpsert } from './MessageUpsert'

export abstract class MessageUpsertWithNlp extends MessageUpsert {
  abstract expectIntent: string
  expectMinScore: number = 1
  // @ts-ignore
  public data: NlpResponse
  setData(data: NlpResponse) {
    this.data = data
  }
}
