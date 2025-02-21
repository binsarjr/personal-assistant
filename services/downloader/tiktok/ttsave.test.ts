import { ttsave } from '$services/downloader/tiktok/ttsave';
import { expect, test } from 'bun:test';

test('ttsave try using valid url', async () => {
  const result = await ttsave('https://vt.tiktok.com/ZS6KHACMH/');
  console.log(result);
  expect(result).toBeDefined();
  expect(result).toHaveProperty('video');
});

test('ttsave try using invalid url', async () => {
  const result = await ttsave('https://vt.tiktok.com/ZSjA3BsadCS1/');
  expect(result).toBeUndefined();
});
