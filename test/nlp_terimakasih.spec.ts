import { before, describe, it } from 'mocha'
import assert from 'node:assert'
import { join } from 'path'
import { neuralNetwork, scanCorpus, text2vec } from '../src/nlp/neural'
import { loadStemmerIdNormalize } from '../src/nlp/stemmer'

before(async () => {
  await loadStemmerIdNormalize()
  const corpus = await scanCorpus(
    join(__dirname, '../../dataset/corpus/**/*.{yaml,yml}'),
  )
  neuralNetwork.train(corpus)
})

describe('Klasifikasi teks Terima Kasih', () => {
  it('terima kasih', () => {
    ;[
      'terima kasih',
      'makasih banyak mas',
      'mksh mas',
      'Terima Kasih',
      'Terima kasih banyak atas bantuan Anda',
      'Terima kasih banyak bang',
      'Sudah benar, terima kasih',
      'makasih, ya',
      'makasih, mas',
      'makasih, kak',
      'Terima kasih atas bantuanmu',
      'Terima kasih banyak',
      'Saya Sangat terima kasih',
    ].map((text) => {
      const resp = neuralNetwork.run(text2vec(text))
      assert.ok(resp.thank >= 0.9, 'Score tidak valid')
    })
  })

  it('tidak terima kasih', () => {
    ;[
      'tidak, terima kasih',
      'gak makasih banyak mas',
      'nggak mksh mas',
      'gk mksh mas',
      'Tidak perlu terima kasih',
      'gak usah terima kasih santai saja',
      'Tidak terima kasih atas perilaku burukmu',
      'Saya tidak berterima kasih atas apa yang kamu lakukan',
      'Saya kecewa dengan tindakanmu',
    ].map((text) => {
      const resp = neuralNetwork.run(text2vec(text))
      assert.ok(resp.thank <= 0.9, 'Score tidak valid')
    })
  })
})
