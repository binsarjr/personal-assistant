# Personal Assistant - WhatsApp Bot

Personal Assistant adalah bot WhatsApp yang dibangun dengan TypeScript dan Bun,
menggunakan library Baileys untuk koneksi WhatsApp Web.

## 🚀 Fitur

- **Multi-Session Support**: Kelola beberapa session WhatsApp sekaligus
- **Interactive CLI**: Setup mudah dengan antarmuka CLI yang user-friendly
- **Session Management**: Tampilkan, pilih, dan kelola session dengan detail
- **Auto Keep-Alive**: Bot tetap aktif dengan sistem monitoring otomatis
- **PM2 Ready**: Siap dijalankan dengan PM2 untuk production

## 📋 Persyaratan

- Node.js 17+ atau Bun
- WhatsApp account untuk linking

## 🛠️ Instalasi

```bash
# Clone repository
git clone <repository-url>
cd personal-assistant

# Install dependencies
bun install

# Atau dengan npm
npm install
```

## 🎯 Penggunaan

### Mode Interactive (Recommended)

Mode ini memberikan pengalaman setup yang mudah dengan GUI CLI dan menu utama:

```bash
# Jalankan mode interactive
bun run interactive

# Atau
bun run start --interactive
```

Mode interactive akan menampilkan **Menu Utama** dengan pilihan:

1. **🔍 Pilih Session yang Ada** - Memilih dari session yang sudah ada
2. **🆕 Buat Session Baru** - Membuat session baru dengan nama custom
3. **🗑️ Hapus Session** - Menghapus session yang tidak diperlukan
4. **❌ Keluar** - Keluar dari aplikasi

Setelah memilih action, sistem akan:

- Menampilkan semua session yang tersedia dengan detail
- Memungkinkan pemilihan session
- Meminta detail koneksi jika diperlukan
- Menjalankan bot dengan konfigurasi yang dipilih

### Mode Direct

Untuk penggunaan langsung dengan parameter:

```bash
# QR Code mode
bun run start --session mybot --mode qrcode

# Pairing Code mode
bun run start --session mybot --mode pairing --phone +6281234567890
```

### Manajemen Session

```bash
# Lihat semua session
bun run sessions

# Atau
bun run start --list

# Mode interactive (dengan menu utama)
bun run interactive

# Lihat bantuan
bun run start --help
```

## 📊 Session Management

### Melihat Daftar Session

```bash
bun run sessions
```

Output akan menampilkan:

- 🟢 **Active**: Session siap digunakan
- 🔴 **Inactive**: Belum ada kredensial
- 🟡 **Corrupted**: Auth store tidak lengkap

### Detail Session

Setiap session menampilkan:

- **Path**: Lokasi penyimpanan session
- **Last Modified**: Waktu terakhir digunakan
- **Size**: Ukuran data session
- **Auth Store**: Status auth store
- **Credentials**: Status kredensial
- **Status**: Status keseluruhan session

## 🔧 Production dengan PM2

### Setup PM2

```bash
# Install PM2 globally
npm install -g pm2

# Jalankan dengan PM2
pm2 start "bun run start -s mybot -m qrcode" --name "whatsapp-bot"

# Atau dengan config file
pm2 start ecosystem.config.js
```

### Ecosystem Config

Buat file `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: "whatsapp-bot",
    script: "bun",
    args: "run start -s mybot -m qrcode",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
    },
  }],
};
```

## 🎮 CLI Commands

| Command                | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `bun run start`        | Jalankan bot (interactive mode jika tidak ada args) |
| `bun run interactive`  | Mode interactive dengan menu utama                  |
| `bun run sessions`     | Lihat semua session                                 |
| `bun run start --help` | Bantuan lengkap                                     |
| `bun run wa:logout`    | Hapus session default                               |

## 📝 CLI Options

| Option             | Short | Description                  |
| ------------------ | ----- | ---------------------------- |
| `--session <name>` | `-s`  | Nama session                 |
| `--mode <mode>`    | `-m`  | Mode koneksi: qrcode/pairing |
| `--phone <number>` | `-p`  | Nomor telepon untuk pairing  |
| `--interactive`    | `-i`  | Mode interactive             |
| `--list`           | `-l`  | Tampilkan daftar session     |
| `--help`           | `-h`  | Bantuan                      |

## 🔍 Contoh Penggunaan

### Setup Session Baru

```bash
# Interactive mode (recommended) - dengan menu utama
bun run interactive

# Pilih menu "2. 🆕 Buat Session Baru"
# Masukkan nama session: "bot-customer-service"
# Pilih mode koneksi (QR Code/Pairing)

# Direct mode
bun run start -s "bot-customer-service" -m qrcode
```

### Menjalankan Session yang Ada

```bash
# Interactive mode - pilih dari menu utama
bun run interactive

# Pilih menu "1. 🔍 Pilih Session yang Ada"
# Pilih session dari daftar

# Langsung jalankan session tertentu
bun run start -s "bot-customer-service" -m qrcode
```

### Menghapus Session

```bash
# Interactive mode - menu utama
bun run interactive

# Pilih menu "3. 🗑️ Hapus Session"
# Pilih session yang ingin dihapus dari daftar

# Manual delete (hati-hati!)
rm -rf .hiddens/session-name
```

### Monitoring Session

```bash
# Lihat semua session
bun run sessions

# Output contoh:
# 📱 Daftar Session WhatsApp:
# ================================================================================
# 1. 🟢 bot-customer-service
#    📁 Path: .hiddens/bot-customer-service
#    📅 Last Modified: 15/01/2024 10:30:45
#    💾 Size: 2.5 MB
#    🔐 Auth Store: ✅
#    🔑 Credentials: ✅
#    📊 Status: 🟢 Active (Ready to use)
```

## 🚨 Troubleshooting

### Session Corrupted

Jika session menunjukkan status 🟡 Corrupted:

```bash
# Hapus session yang bermasalah
rm -rf .hiddens/session-name

# Buat ulang session
bun run start -s session-name -m qrcode
```

### Bot Tidak Merespons

1. Periksa status session dengan `bun run sessions`
2. Pastikan WhatsApp Web tidak login di browser lain
3. Restart bot dengan PM2: `pm2 restart whatsapp-bot`

### Koneksi Gagal

1. Pastikan internet stabil
2. Coba mode pairing jika QR code gagal
3. Periksa log untuk error detail

## 🤝 Contributing

1. Fork repository
2. Buat branch feature (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgments

- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [Bun](https://bun.sh/) - Fast JavaScript runtime
- [PM2](https://pm2.keymetrics.io/) - Process manager
