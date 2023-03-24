// @ts-nocheck
import { dockStart } from '@nlpjs/basic'

let dock
let nlp
dockStart().then((d) => {
  nlp = d.get('nlp')
  dock = d
})

const waitUntilDockReady = () =>
  new Promise((resolve) => {
    let id
    id = setInterval(() => {
      if (dock) {
        clearInterval(id)
        resolve(true)
      }
    }, 1000)
  })

export interface NlpResponse {
  answer: string
  score: number
  intent: string
}

export const nlpProcess = async (text: string) => {
  await waitUntilDockReady()
  return nlp.process(text)
}
