module.exports = {
  apps: [
    {
      name: 'personal-assistant-main',
      script: 'bun',
      args: 'run start -s main -m qrcode',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        BOT_NAME: 'Personal Assistant Main'
      },
      env_production: {
        NODE_ENV: 'production',
        BOT_NAME: 'Personal Assistant Main'
      },
      error_file: 'logs/personal-assistant-main-error.log',
      out_file: 'logs/personal-assistant-main-out.log',
      log_file: 'logs/personal-assistant-main.log',
      time: true
    },
    {
      name: 'personal-assistant-backup',
      script: 'bun',
      args: 'run start -s backup -m pairing -p +6281234567890',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        BOT_NAME: 'Personal Assistant Backup'
      },
      env_production: {
        NODE_ENV: 'production',
        BOT_NAME: 'Personal Assistant Backup'
      },
      error_file: 'logs/personal-assistant-backup-error.log',
      out_file: 'logs/personal-assistant-backup-out.log',
      log_file: 'logs/personal-assistant-backup.log',
      time: true
    }
  ]
}; 