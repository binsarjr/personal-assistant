# default
## konteks
klasifikasi tidak sesuai dan tidak ditemukan, ketika konteks lebih condong ke yang lain

## rule
- ketika tidak ada satupun konteks yang terpenuhi maka ini adalah schema default yang akan diberikan.
- ketika pesan tidak termasuk kedalam konteks manapun

## schema
{
  "type": "default",
  "note": string,
  "answer": string
}

## example
{
  "type": "default",
  "note": {{ tuliskan catatanmu disini }},
  "answer": "belum ada intruksi terkait ini"
}
