#!/bin/bash

export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/root/.bun/bin

# ================== Konfigurasi ==================
APP_DIR="/root/punyaku"        # Direktori tempat program berjalan
SCREEN_NAME="bun_session"      # Nama sesi screen
PROCESS_NAME="bun"             # Nama proses yang akan dicek

# ================== Cek Status Screen ==================
# Periksa apakah screen dengan nama yang sama sudah berjalan
if screen -list | grep -q "$SCREEN_NAME"; then
    # Cek apakah proses dalam screen masih berjalan
    if ! screen -S "$SCREEN_NAME" -X select . > /dev/null 2>&1; then
        # Screen ditemukan tetapi mengalami error atau mati, jalankan ulang
        screen -X -S "$SCREEN_NAME" quit 2>/dev/null  # Hapus screen jika ada error
        cd "$APP_DIR" || exit
        screen -dmS "$SCREEN_NAME" bun start
    fi
else
    # Screen tidak ditemukan, jalankan program dalam screen baru
    cd "$APP_DIR" || exit
    screen -dmS "$SCREEN_NAME" bun start
fi
