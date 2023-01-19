import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { dataStorePath } from '../utils'

const filepath = join(dataStorePath, 'sibuk.txt')

export const setSibuk = (sibuk: string) => {
  writeFileSync(filepath, sibuk)
}
export const getSibuk = () => {
  try {
    return readFileSync(filepath).toString().trim()
  } catch (error) {
    return null
  }
}
