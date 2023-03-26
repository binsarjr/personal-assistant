import { neuralNetwork, text2vec } from './neural'
import { loadStemmerIdNormalize } from './stemmer'

const main = async () => {
  await loadStemmerIdNormalize()
  const r = neuralNetwork.run(text2vec('mksih'))
  console.log(r)
}
main()
