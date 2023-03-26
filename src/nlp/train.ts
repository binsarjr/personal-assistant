import { writeFileSync } from 'fs'
import { join } from 'path'
import { neuralModelPath, neuralNetwork, scanCorpus } from './neural'

const main = async () => {
  const corpus = await scanCorpus(
    join(__dirname, '../../dataset/corpus/**/*.{yaml,yml}'),
  )
  neuralNetwork.train(corpus)
  writeFileSync(neuralModelPath, JSON.stringify(neuralNetwork.toJSON()))
}
main()
