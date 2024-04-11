import { Buffer } from 'buffer';

export default async (buffer: Buffer, type?: string): Promise<string> => {
  const blob = new Blob([new Uint8Array(buffer).buffer], {
    type,
  });
  const formData: FormData = new FormData();
  const baseUrl = 'https://telegra.ph';

  formData.append('file', blob, 'tmp.' + type);

  const response = await fetch(baseUrl + '/upload', {
    method: 'POST',
    body: formData,
  });

  const images: { src: string }[] = await response.json();

  return baseUrl + images[0]!.src;
};
