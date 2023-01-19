import { makeInMemoryStore } from '@adiwajshing/baileys'

export class MemoryDataStore {
  public readonly store = makeInMemoryStore({})
  constructor(private filepath: string) {
    this.store.readFromFile(filepath)
    setInterval(() => {
      this.store.writeToFile(filepath)
    }, 10_000)
  }
}
