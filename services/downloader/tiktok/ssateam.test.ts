import { ssateam } from '$services/downloader/tiktok/ssateam';
import { expect, it } from 'bun:test';

it('ssateam try using valid url', async () => {
  const result = await ssateam('https://vt.tiktok.com/ZS6KHACMH/');
  expect(result).toBeDefined();
  console.log(result);
  expect(result).toHaveProperty('data');
});

it('ssateam try using invalid url', async () => {
  const result = await ssateam('https://vt.tiktok.com/ZSjA3BsadCS1/');
  expect(result).toBeUndefined();
});
