import Cheerio from "cheerio";
import FormData from "form-data";
import got from "got";
import tough from "tough-cookie";

export type ApkInfo = {
	tanggal_upload: string;
	hash: string;
	filename: string;
	type: "Tidak terdeteksi" | "MENUNGGU DIPROSES" | "VIRUS" | "Bukan Virus";
	description: string;
	link: string;
	download: string;
};

export default class {
	request = got.extend({
		cookieJar: new tough.CookieJar(),
	});
	async getCaptchaImage() {
		const text = await this.request.get("https://apk.ibnux.com").text();
		const captcha = text.match(/<img\s+src="(data:[^"]+)"/)!;
		return captcha[1] as string;
	}
	parseTableRow(tr: cheerio.Cheerio): ApkInfo {
		const tds = tr.find("td");

		const tanggal_upload = tds.eq(0).text();
		const hash = (tds.eq(1).find("a").attr("href")?.toString() || "")
			.split("=")[1]!
			.split("#")[0];
		const filename = tds.eq(2).text();
		const type = tds.eq(4).text().trim() as
			| "Tidak terdeteksi"
			| "MENUNGGU DIPROSES"
			| "VIRUS"
			| "Bukan Virus";
		const description = tds.eq(5).text();
		return {
			tanggal_upload,
			hash,
			filename,
			type,
			description,
			link: `https://apk.ibnux.com/?hash=${hash}`,
			download: `https://apk.ibnux.com/?dl=${hash}`,
		};
	}

	findByHash(hash: string, html: string): ApkInfo | null {
		const $ = Cheerio.load(html);
		let result: ApkInfo | null = null;
		$("table tr").each((i, tr) => {
			const _result: ApkInfo = this.parseTableRow($(tr));
			if (hash == _result?.hash) {
				result = _result;
			}
		});
		return result;
	}

	async upload(apk: Buffer, filename: string) {
		let response = "";
		while (true) {
			const imagebase64 = await this.getCaptchaImage();

			const kode = await this.request
				.post("https://mediasaver.binsarjr.com/services/solve-captcha/number", {
					form: {
						target_length: 5,
						imagebase64,
					},
				})
				.text();

			const form = new FormData();
			form.append("capcay", kode);
			form.append("apk", apk, { filename: filename });
			form.append("upload", "yes");

			response = await this.request
				.post("https://apk.ibnux.com", {
					body: form,
				})
				.text();
			if (!response.includes("Kode Capcay salah")) {
				break;
			}
		}

		const $ = Cheerio.load(response);
		const textAlert = $("div.alert").text();

		if (textAlert.includes("APK Sudah ada")) {
			return this.parseTableRow($("table tr").eq(0)!);
		}

		const regex =
			/APK sukses diupload dengan kode <a\s.*?href=".*?#(.*?)".*?>.*?<\/a>/;
		const match = response.match(regex);

		const hash = match ? match[1] : "";

		return this.findByHash(hash, response);
	}
}
