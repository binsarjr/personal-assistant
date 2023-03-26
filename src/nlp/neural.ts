import { existsSync, readFileSync } from 'fs'
import { glob } from 'glob'
import yaml from 'js-yaml'

// @ts-ignore
import { NeuralNetwork } from '@nlpjs/neural'
import natural from 'natural'
import { rootPath } from '../utils'
import { normalizeId } from './stemmer'
export interface TrainData {
  input: {
    [i: string]: number
  }
  output: {
    [i: string]: number
  }
}
const tokenizer = new natural.WordTokenizer()
// @ts-ignore
const stopWords = new Set(natural.stopwords)

/**
 * Membersihkan kalimat yang diberikan dengan menghilangkan kata tidak penting.
 * Fungsi ini menggunakan tokenizer untuk memisahkan kalimat menjadi kata-kata,
 * kemudian membersihkan kata-kata dengan menggunakan stemmer dan melewati kata-kata
 * yang bukan stopwords.
 *
 * @param sentence - kalimat yang akan dimasukkan.
 * @returns kalimat yang telah dibersihkan.
 */
export const cleaningSentence = (sentence: string) => {
  const words = tokenizer
    .tokenize(sentence)
    .map((word) => natural.StemmerId.stem(word))
    .filter((word) => !stopWords.has(word.toLowerCase()))
  const cleanedSentence = words.join(' ')
  return cleanedSentence
}

export const text2vec = (sentence: string) => {
  /**
   * Menghapus ekspresi reguler berulang dalam kalimat.
   * Menggunakan ekspresi reguler untuk mencari dan mengganti karakter berulang.
   * Kecuali huruf "g" karena banyak kondisi tertentu seperti "nggk" "angga" dsb
   *
   * Contoh: makasihhhh -> makasih
   */
  sentence = sentence.replace(/([^g])\1+/gi, '$1')
  sentence = normalizeId(sentence)
  sentence = cleaningSentence(sentence)
  const input: { [i: string]: number } = {}
  sentence = normalizeId(sentence)
  sentence.split(/\s+/).map((s) => (input[s] = 1))
  return input
}

export const scanCorpus = async (...pathPattern: string[]) => {
  const files = await glob(pathPattern)
  let corpus: TrainData[] = []
  for (const file of files) {
    const yamlData = readFileSync(file, 'utf8')
    const _corpus = yaml.load(yamlData) as { lang?: string; data: TrainData[] }

    corpus = [
      ...corpus,
      ..._corpus.data.map((d) => {
        /**
         * Jika ada key lang maka berikan expect output lang_{country}
         * dengan isi matrix barupa 1 jika semua output lainnnya bernilai satu
         */
        const valueInput = Object.keys(d.output).map((key) => d.output[key])
        if (_corpus.lang)
          d.output['lang_' + _corpus.lang] = Number(
            valueInput.every((v) => v == 1),
          )
        return d
      }),
    ]
  }
  return corpus
}

export const neuralNetwork = new NeuralNetwork({
  learningRate: 0.2,
  log: true,
})

export const neuralModelPath = rootPath('model.nlp')
export const loadModelNeuralNetWork = () => {
  // load model if exists
  if (existsSync(neuralModelPath)) {
    neuralNetwork.fromJSON(JSON.parse(readFileSync(neuralModelPath).toString()))
  }
}
