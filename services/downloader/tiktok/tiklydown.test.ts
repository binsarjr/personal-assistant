import { tiktokdl } from '$services/downloader/tiktok';
import { expect, test } from 'bun:test';
test('tiklydown try using valid url', async () => {
  const result = await tiktokdl.tiklydown('https://vt.tiktok.com/ZSjA3BCS1/');
  expect(result).toBeDefined();
  console.log(result);
  expect(result).toHaveProperty('video');
});

test('tiklydown try using invalid url', async () => {
  const result = await tiktokdl.tiklydown(
    'https://vt.tiktok.com/ZSjA3BsadCS1/',
  );
  expect(result).toBeUndefined();
});
