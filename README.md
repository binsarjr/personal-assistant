# Cara NeuralNetwork Bekerja di sini
Train
`corpus` => `add lang if exist`
data input ataupun output di corpus cukup masukkan konteks besarnya saja tanpa harus memasukkan semua jenis teks.


Pemrosesan (sudah di training)
`remove duplicated character` => `stemming (slangword)` => `stopwords` => `stemming (slangword)` => `jadi data yang bisa diinputkan` 

sebelum di jadikan data vector kalimat harus di pastikan sudah menjadi susunan kata yang baku dan tidak ada slangword ataupun sejenisnya.


contoh

`aq suka nich yg mnis manis, mksh ya`

akan menjadi
```js
{
    aku: 1,
    suka: 1,
    nih: 1,
    yang: 1,
    manis: 1,
    makasih: 1,
    ya: 1,
}
```