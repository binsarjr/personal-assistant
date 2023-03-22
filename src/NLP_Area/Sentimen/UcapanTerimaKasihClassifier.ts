import csv from 'csv-parser'
import fs from 'fs'
import natural from 'natural'
import { rootPath } from '../../utils'

class UcapanTerimaKasihClassifierClass {
  private isLoaded = false
  classifier = new natural.BayesClassifier(natural.StemmerId)
  constructor(
    private trainpath = rootPath('database/ucapanterimakasih'),
    private dataset = rootPath('dataset/terimakasih.csv'),
  ) {
    natural.BayesClassifier.load(
      this.trainpath,
      natural.StemmerId,
      (err, classifier) => {
        if (!err) {
          this.classifier = classifier
          this.isLoaded = true
        }
      },
    )
  }
  async train() {
    return new Promise((resolve, reject) => {
      fs.createReadStream(this.dataset)
        .pipe(csv())
        .on('data', (row) => {
          this.classifier.addDocument(row.text, row.label)
        })
        .on('end', () => {
          this.classifier.train()
          this.classifier.save(this.trainpath, (err) => reject(err))
          resolve(true)
        })
    })
  }
  async waitUntilLoaded() {
    if (this.isLoaded) return true
    return new Promise((resolve, reject) => {
      let intervalId: any
      let timeoutid: any
      const clear = () => {
        intervalId && clearInterval(intervalId)
        timeoutid && clearTimeout(timeoutid)
      }
      intervalId = setInterval(() => {
        if (this.isLoaded) {
          clear()
          resolve(this.isLoaded)
        }
      }, 1000)
      timeoutid = setTimeout(() => {
        clear()
        reject(new Error('Gagal load data dari file: ' + this.trainpath))
      }, 10_000)
    })
  }
}


const UcapanTerimaKasihClassifier = new UcapanTerimaKasihClassifierClass()
// UcapanTerimaKasihClassifier.waitUntilLoaded()
//   .then((_) => {
//     console.log(UcapanTerimaKasihClassifier.classifier.classify('terima kasih'))
//   })
//   .catch((_) => {
//     UcapanTerimaKasihClassifier.train()
//     console.log(
//       UcapanTerimaKasihClassifier.classifier.classify('terima kasih'),
//       'ok',
//     )
//   })

export default UcapanTerimaKasihClassifier
