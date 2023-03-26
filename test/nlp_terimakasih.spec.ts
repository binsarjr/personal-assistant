import { before, describe, it } from 'mocha'
import assert from 'node:assert'
import {
  loadModelNeuralNetWork,
  neuralNetwork,
  text2vec,
} from '../src/nlp/neural'
import { loadStemmerIdNormalize } from '../src/nlp/stemmer'

before(async () => {
  await loadStemmerIdNormalize()
  loadModelNeuralNetWork()
})

describe('Klasifikasi teks Terima Kasih', () => {
  it('terima kasih', () => {
    ;[
      'aq makasih banyak loh ya',
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
      'mkasihh mas',
      'mksihhhh',
      'matur nuwun',
      'nuwun',
      'suwun',
      'tq',
      'thank u',
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
      'gk usah mas.mkasih',
      `Hi 

Berikut adalah OTP Anda: 043827 untuk melakukan verifikasi login ke AmikomOne.

Silahkan masukkan kode tersebut sebelum pukul 07:16:58 WIB.

Terima kasih,

Admin AmikomOne

Universitas Amikom Yogyakarta`
    ].map((text) => {
      const resp = neuralNetwork.run(text2vec(text))
      assert.ok(resp.thank <= 0.9, 'Score tidak valid')
    })
  })

  it('dalam bahasa jawa', () => {
    ;['matur nuwun', 'nuwwun', 'suwuuuun'].map((text) => {
      const resp = neuralNetwork.run(text2vec(text))
      assert.ok(resp.thank >= 0.9, 'Score tidak valid')
      assert.ok(resp.lang_jawa >= 0.9, 'Score tidak valid')
    })
  })

  it('dalam bahasa inggris', () => {
    ;['thank you'].map((text) => {
      const resp = neuralNetwork.run(text2vec(text))
      assert.ok(resp.thank >= 0.9, 'Score tidak valid')
      assert.ok(resp.lang_english >= 0.9, 'Score tidak valid')
    })
  })
})
