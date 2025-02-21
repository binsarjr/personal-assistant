#!/bin/bash

# RUN with crontab

# ================== KONFIGURASI ==================
PROJECT_NAME="PersonalAssistant"
PROJECT_DIR="/root/personal-assistant"
BRANCH="main"
LOG_FILE="/var/log/deploy_personal_assistant.log"
DEPLOY_LOCK="/tmp/deploy_personal_assistant.lock"
SCREEN_NAME="PersonalAssistant"
BUN_PATH="/root/.bun/bin"
ENV_FILE=".env"
# ================================================
export PATH=$PATH:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/root/.bun/bin
export PATH=$PATH:$BUN_PATH

# Log waktu pemanggilan deploy
echo "$(date) - Checking for updates..." >> "$LOG_FILE"

# Masuk ke direktori proyek
cd "$PROJECT_DIR" || exit

# Pastikan di branch yang benar
git checkout "$BRANCH"

# Cek apakah proses deploy sedang berjalan
cleanup() {
    rm -f "$DEPLOY_LOCK"
}

if [[ -f "$DEPLOY_LOCK" ]]; then
    echo "$(date) - Deployment is already in progress. Skipping new deployment." >> "$LOG_FILE"
    exit 0
fi

touch "$DEPLOY_LOCK"
trap cleanup EXIT  # Pastikan lock file dihapus setelah selesai

# Ambil argumen untuk opsi --force
FORCE_DEPLOY=false
if [[ "$1" == "--force" ]]; then
    FORCE_DEPLOY=true
fi

# Simpan hash commit sebelum pull
PREV_COMMIT=$(git rev-parse HEAD)

# Cek perubahan dari git pull
GIT_OUTPUT=$(git pull)
NEW_COMMIT=$(git rev-parse HEAD)

if [[ "$GIT_OUTPUT" == *"Already up to date."* && "$FORCE_DEPLOY" == false && "$PREV_COMMIT" == "$NEW_COMMIT" ]]; then
    echo "$(date) - No updates found. Skipping restart." >> "$LOG_FILE"
    exit 0
else
    echo "$(date) - Updates detected or forced deployment triggered. Running Bun install..." >> "$LOG_FILE"

    # Install dependensi
    bun install

    # Restart aplikasi
    echo "$(date) - Restarting application..." >> "$LOG_FILE"

    screen -S "$SCREEN_NAME" -X quit
    pkill -f "bun start"
    screen -wipe

    # Jalankan aplikasi di dalam screen baru
    export $(cat "$ENV_FILE" | xargs)
    screen -dmS "$SCREEN_NAME" bun start

    echo "$(date) - Deployment finished successfully!" >> "$LOG_FILE"
fi