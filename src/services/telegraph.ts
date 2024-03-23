import { Buffer } from "buffer";
import { fileTypeFromBuffer, FileTypeResult } from "file-type";

export default async (buffer: Buffer): Promise<string> => {
	const fileType: FileTypeResult | undefined = await fileTypeFromBuffer(buffer);
	const blob = new Blob([new Uint8Array(buffer).buffer], {
		type: fileType?.mime,
	});
	const formData: FormData = new FormData();
	const baseUrl = "https://telegra.ph";

	formData.append("file", blob, "tmp." + fileType?.ext);

	const response = await fetch(baseUrl + "/upload", {
		method: "POST",
		body: formData,
	});

	const images: { src: string }[] = await response.json();

	return baseUrl + images[0]!.src;
};
