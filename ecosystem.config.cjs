module.exports = {
  apps: [
    {
      name: 'Personal Whatsapp Bot',
      script: './dist/main.js',
      autorestart: true,
      exp_backoff_restart_delay: 100,
    },
  ],
};
