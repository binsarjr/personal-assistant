# Personal Assistant

This is a personal assistant project created with TypeScript and Bun.
This personal assistant is designed to facilitate the use of WhatsApp by
utilizing the WhatsApp action feature. This WhatsApp action feature can be used
to create features similar to regular WhatsApp features, but with easier and
more efficient functionality.

## Features

- Auto-Reveal view-once messages
- Auto-Reveal Deleted Message
- Auto-Reveal deleted stories
- Mention all group admins
- Mention all group members
- Mention everyone in the group
- Auto-Reveal and Track edited messages, allowing visibility of messages before they were edited


## Random Features
- Tiktok Downloader
- Simple Sticker Maker
- Gemini

## Installation

First, install [Bun](https://bun.sh/docs/installation).

### Install dependencies:
```bash
bun install
```

### Running the application
```bash
# development
bun run start

# watch mode
bun run dev
```

## Multi-Session Usage (Multiple WhatsApp Devices)

You can run multiple WhatsApp sessions (devices) in parallel using CLI arguments. Each session is identified by a unique `--session` name.

### QR Code Login (default)
```bash
bun run src/main.ts --session main --mode qrcode
```

### Pairing Code Login
```bash
# With phone number as argument
bun run src/main.ts --session backup --mode pairing --phone +6281234567890

# Or, if --phone is omitted, you will be prompted to enter it interactively
bun run src/main.ts --session backup --mode pairing
```

### Example PM2 Configuration
You can use [PM2](https://pm2.keymetrics.io/) to manage multiple sessions:

```json
{
  "apps": [
    {
      "name": "wa-main",
      "script": "src/main.ts",
      "interpreter": "bun",
      "args": "--session main --mode qrcode"
    },
    {
      "name": "wa-backup",
      "script": "src/main.ts",
      "interpreter": "bun",
      "args": "--session backup --mode pairing --phone +6281234567890"
    }
  ]
}
```

## Release Notes

### v4.1.0
- Multi-session WhatsApp client: jalankan beberapa device sekaligus dengan argumen CLI (`--session`, `--mode`, `--phone`)
- Migrasi cronjob ke library croner (lebih efisien dan modern)
- CLI argument parsing dengan minimist
- Pairing code login dengan validasi nomor telepon (libphonenumber-js)
- Dokumentasi penggunaan multi-sesi dan integrasi PM2
- Perbaikan dan update dependensi

---

## Documentation

Lihat seluruh instruksi penggunaan, fitur, dan setup di README ini. Untuk pertanyaan lebih lanjut atau kontribusi, silakan buka issue atau pull request di repository ini.