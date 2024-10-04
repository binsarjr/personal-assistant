# Personal Assistant

ini adalah project personal assistant yang dibuat dengan typescript dan nestjs. Personal asistant ini dibuat untuk
memudahkan penggunaan whatsapp dengan menggunakan fitur whatsapp action. Fitur whatsapp action ini dapat digunakan untuk
membuat fitur yang sama seperti fitur whatsapp biasa, tetapi dengan fitur yang lebih mudah dan lebih efisien.

## Fitur

- Menambahkan Peserta ke Grup
- Menghapus Peserta dari Grup
- Menghapus Satu Grup
- Anti pesan sekali lihat
- Anti pesan yang dihapus
- Anti story yang dihapus
- Mention semua admin grup
- Mention semua member grup
- Mention semua orang yang ada di grup
- Downloader Instagram
- Downloader Tiktok

## Instalasi

boleh menggunakna `npm`, `yarn`, atau `pnpm`.

disini saya mencontohkan menggunakna `pnpm`.

### Install dependencies:

```bash
pnpm install
```

Install nest cli

```bash
npm install -g @nestjs/cli
```

### Setup Environment

copy file `.env.example` ke file `.env` dan edit sesuai keinginan.

```bash
cp .env.example .env
```

Sesuaikan environtment dengan konfigurasi yang anda diinginkan.

### Setup database

```
pnpx prisma db push
```

### Menjalankan aplikasi

```bash
# development
pnpm run start

# watch mode
pnpm run start:dev
```

### Build & Deploy

Lakukan build terlebih dahulu

```
pnpm run build
```

setelah di build, akan ada folder `dist` yang berisi aplikasi yang dibuat. Lalu copy file `dist` ke server yang ingin di
deploy.

lalu jalankan perintah berikut

```
node --env-file=.env dist/main.js
```
