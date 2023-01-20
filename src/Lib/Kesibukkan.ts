import { appendFileSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { dataStorePath } from '../utils'

const filepath = join(dataStorePath, 'sibuk.txt')
const filepathSudahDiKasihTahu = join(
  dataStorePath,
  'sibuk_sudahdikasihtahu.txt',
)
writeFileSync(filepathSudahDiKasihTahu, '')
export const setSibuk = (sibuk: string) => {
  writeFileSync(filepathSudahDiKasihTahu, '')
  writeFileSync(filepath, sibuk)
}
export const getSibuk = () => {
  try {
    return readFileSync(filepath).toString().trim()
  } catch (error) {
    return null
  }
}

export const setSudahDikasihTahu = (jid: string) => {
  appendFileSync(filepathSudahDiKasihTahu, jid + '\n')
}

export const hasSudahDikasihTahu = (jid: string) =>
  readFileSync(filepathSudahDiKasihTahu).toString().includes(jid)
