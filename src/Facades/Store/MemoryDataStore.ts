import { makeInMemoryStore } from '@whiskeysockets/baileys'

export class MemoryDataStore {
  public readonly store = makeInMemoryStore({})
  constructor(private filepath: string) {
    this.store.readFromFile(filepath)
    setInterval(() => {
      this.writeToFile()
    }, 10_000)
  }
  writeToFile() {
    this.store.writeToFile(this.filepath)
  }
}
