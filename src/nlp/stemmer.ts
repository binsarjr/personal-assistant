import { rootPath } from '../utils'
import { readDataStem } from './utils'

let dataStem: { [i: string]: string } = {}

export const normalizeId = (text: string) =>
  text
    .split(/\s+/)
    .map((word) => dataStem[word] ?? word)
    .join(' ')

export const loadStemmerIdNormalize = async () => {
  if (Object.keys(dataStem).length === 0) {
    dataStem = await readDataStem(rootPath('dataset/stemmer/**/*.csv'))
  }
}
