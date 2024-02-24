module.exports = {
	apps: [
		{
			name: "Personal Whatsapp Bot",
			cron_restart: "0 0 * * *",
			restart_delay: 2000,
			script: "./lib/index.js",
			watch: ["lib"],
			exp_backoff_restart_delay: 100,
		},
	],
};
