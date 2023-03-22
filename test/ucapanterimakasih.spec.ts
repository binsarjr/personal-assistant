import assert from 'node:assert'
import { it } from 'node:test'
import UcapanTerimaKasihClassifier from '../src/NLP_Area/Sentimen/UcapanTerimaKasihClassifier'
UcapanTerimaKasihClassifier.waitUntilLoaded().then((_) => {
  it('Ucapan Terima Kasih', () => {
    assert.equal(
      1,
      UcapanTerimaKasihClassifier.classifier.classify(
        'Terima Kasih banyak mas',
      ),
    )
  })
})
