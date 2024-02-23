import DB from "./services/database.js";
import { loadEnv } from "./supports/env.js";

loadEnv();

// signal exit
process.on("beforeExit", async () => {
	console.log("Aplikasi akan keluar...");

	console.log("Saving...");
	await DB.write();
	console.log("Saved");

	console.log("Eksekusi sebelum keluar selesai.");
	process.exit();
});

process.on("SIGINT", async () => {
	console.log("Aplikasi menerima sinyal SIGINT (Ctrl+C).");

	// Lakukan penanganan sesuai kebutuhan, misalnya simpan data sebelum keluar
	console.log("Saving...");
	await DB.write();
	console.log("Saved");

	// Keluar dari aplikasi setelah menyelesaikan tugas terakhir
	process.exit();
});

// while (true) {
// 	console.log("oke", process.env.DATABASE_FILE);
// 	await new Promise((resolve) => setTimeout(resolve, 1000));
// }
console.log(DB.chain.get("owner").value());
