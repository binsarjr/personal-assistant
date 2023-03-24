// // import UcapanTerimaKasihClassifier from './NLP_Area/Sentimen/UcapanTerimaKasihClassifier'


// // UcapanTerimaKasihClassifier.train().then((_) => {
// //   const data = ['sangat menghargai bantuanmu dalam situasi ini','halo kak','makasih mas','terima kasih banyak']

// //   data.map((d) => {
// //     const c = UcapanTerimaKasihClassifier.classifier.getClassifications(d)
// //     console.log(c, d)
// //   })
// // })

// function trainAndClassify(texts: { text: string; label: string }[]) {
//   const classifier = new BayesClassifier()

//   // Melatih model dengan data pelatihan
//   texts.forEach((item) => classifier.addDocument(item.text, item.label))
//   classifier.train()

//   // Melakukan klasifikasi pada teks
//   const classifications = texts.map((item) => {
//     return {
//       text: item.text,
//       label: classifier.classify(item.text),
//     }
//   })

//   return classifications
// }
// const texts = [
//       { text: 'Terima kasih atas bantuanmu', label: 'terima kasih' },
//       { text: 'Terima kasih banyak', label: 'terima kasih' },
//       { text: 'Terima kasih', label: 'terima kasih' },
//       { text: 'Sangat terima kasih', label: 'terima kasih' },
//       { text: 'Tidak terima kasih atas perilaku burukmu', label: 'tidak terima kasih' },
//       { text: 'Saya tidak berterima kasih atas apa yang kamu lakukan', label: 'tidak terima kasih' },
//       { text: 'Saya kecewa dengan tindakanmu', label: 'tidak terima kasih' }
//     ];
//     const result = trainAndClassify(texts);
//     const numCorrect = result.filter(item => item.label === 'terima kasih').length;
//     const accuracy = numCorrect / result.length
//     console.log(accuracy)