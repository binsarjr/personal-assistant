
# dinamis
## konteks
Label kan dan kategori pertanyaan dari pengguna sebagai corpus atau label klasifikasi apa. sesuai dan utamakan pada konteks type yang pada pada list rule

## rule
- type yang diijinkan adalah tidak boleh selain dari pada konteks ini:
  - aboutme
  - ask_for_cv
  - ask_for_resume


## schema
{
  "type":string,
  "lang": string,
  "answer": string
}

## example
{
  "type":{{ jawabanmu dalam bentuk snake case}},
  "lang": {{language code}}
  "answer": {{answer}}
}
