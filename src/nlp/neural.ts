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

export const cleaningSentence = (sentence: string) => {
  const words = tokenizer
    .tokenize(sentence)
    .map((word) => natural.StemmerId.stem(word))
    .filter((word) => !stopWords.has(word.toLowerCase()))
  const cleanedSentence = words.join(' ')
  return cleanedSentence
}

export const text2vec = (sentence: string) => {
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
    const _corpus = yaml.load(yamlData) as TrainData[]
    corpus = [...corpus, ..._corpus]
  }
  return corpus
}

export const neuralNetwork = new NeuralNetwork({
  learningRate: 0.9,
  log: true,
})

export const neuralModelPath = rootPath('model.nlp')

// load model if exists
if (existsSync(neuralModelPath)) {
  neuralNetwork.fromJSON(JSON.parse(readFileSync(neuralModelPath).toString()))
}
