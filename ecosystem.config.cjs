module.exports = {
	apps: [
		{
			name: "Personal Whatsapp Bot",
			cron_restart: "0 0 * * *",
			restart_delay: 2000,
			script: "bun",
			args: "./lib/index.js",
			exp_backoff_restart_delay: 100,
		},
	],
};
