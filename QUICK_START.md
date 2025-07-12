# 🚀 Quick Start Guide - Personal Assistant

## 📋 Menu Utama Interactive

```bash
bun run interactive
```

**Menu yang tersedia:**

1. **🔍 Pilih Session yang Ada** - Jalankan session yang sudah ada
2. **🆕 Buat Session Baru** - Buat session baru dengan nama custom
3. **🗑️ Hapus Session** - Hapus session yang tidak diperlukan
4. **❌ Keluar** - Keluar dari aplikasi

## 🎯 Common Commands

| Command                            | Description                            |
| ---------------------------------- | -------------------------------------- |
| `bun run interactive`              | **Mode interactive dengan menu utama** |
| `bun run sessions`                 | **Lihat semua session**                |
| `bun run start -s mybot -m qrcode` | **Jalankan session langsung**          |
| `bun run start --help`             | **Bantuan lengkap**                    |

## 🔧 Setup Session Baru

### 1. Interactive Mode (Recommended)

```bash
bun run interactive
# Pilih: 2. 🆕 Buat Session Baru
# Input nama: "my-whatsapp-bot"
# Pilih mode: QR Code atau Pairing
```

### 2. Direct Mode

```bash
# QR Code
bun run start -s "my-whatsapp-bot" -m qrcode

# Pairing Code
bun run start -s "my-whatsapp-bot" -m pairing -p +6281234567890
```

## 📊 Session Status

- 🟢 **Active**: Siap digunakan
- 🔴 **Inactive**: Belum ada credentials
- 🟡 **Corrupted**: Auth store tidak lengkap

## 🗑️ Hapus Session

### Interactive Mode

```bash
bun run interactive
# Pilih: 3. 🗑️ Hapus Session
# Pilih session dari daftar
```

### Manual Delete

```bash
rm -rf .hiddens/session-name
```

## 🚀 Production dengan PM2

```bash
# Install PM2
npm install -g pm2

# Jalankan single session
pm2 start "bun run start -s mybot -m qrcode" --name "whatsapp-bot"

# Jalankan multiple sessions
pm2 start ecosystem.config.js

# Monitor
pm2 logs whatsapp-bot
pm2 status
```

## 🆘 Troubleshooting

### Session Corrupted (🟡)

```bash
# Hapus dan buat ulang
rm -rf .hiddens/session-name
bun run interactive
# Pilih: 2. 🆕 Buat Session Baru
```

### Bot Tidak Merespons

```bash
# Cek status session
bun run sessions

# Restart dengan PM2
pm2 restart whatsapp-bot
```

### Prompt CLI Terganggu Log

- Masalah sudah diperbaiki: Log decorator dipindah setelah CLI selesai
- Jika masih terjadi, pastikan tidak ada console.log sebelum CLI

## 📱 Contoh Workflow

1. **First Time Setup**:
   ```bash
   bun run interactive
   # → Pilih "2. 🆕 Buat Session Baru"
   # → Input nama: "production-bot"
   # → Pilih "1. QR Code"
   # → Scan QR di WhatsApp
   ```

2. **Daily Usage**:
   ```bash
   bun run interactive
   # → Pilih "1. 🔍 Pilih Session yang Ada"
   # → Pilih "production-bot"
   # → Bot running!
   ```

3. **Production Deployment**:
   ```bash
   pm2 start "bun run start -s production-bot -m qrcode" --name "wa-bot"
   ```

## 🎉 Tips

- Gunakan **interactive mode** untuk setup yang mudah
- Nama session bisa bebas (misal: `customer-service`, `personal-bot`, dll)
- Session disimpan di folder `.hiddens/`
- Backup session penting sebelum menghapus
- Gunakan PM2 untuk production deployment
