import type { TiktokDlResult } from '$services/downloader/tiktok/tiktok';
import { getRandomUserAgent } from '$services/user-agent';
import { load } from 'cheerio';

export const ttsave = async (
  url: string,
): Promise<TiktokDlResult | undefined> => {
  const body = await fetch('https://ttsave.app/download', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': getRandomUserAgent(),
      origin: 'https://ttsave.app',
    },
    body: JSON.stringify({
      language_id: '1',
      query: url,
    }),
  }).then((res) => res.text());

  const $ = load(body);
  const $div = $('div.flex');
  const nickname = $div.find('h2').text();
  const username = $div.find('a.font-extrabold').text();
  const avatar = $div.find('a > img').attr('src');
  const description = $div.find('p').text();
  const $span = $div.find('div.flex > div.flex > span');
  const played = $span.eq(0).text();
  const commented = $span.eq(1).text();
  const saved = $span.eq(2).text();
  const shared = $span.eq(3).text();
  const song = $div.find('div.flex > span').eq(4).text();
  const noWatermark = $('#button-download-ready a[type="no-watermark"]').attr(
    'href',
  );

  const withWatermark = $('#button-download-ready a[type="watermark"]').attr(
    'href',
  );

  const audio = $('#button-download-ready a[type="audio"]').attr('href');
  const thumbnail = $('#button-download-ready a[type="cover"]').attr('href');

  const slides: string[] = [];

  $('#button-download-ready a[type="slide"]').each((i, el) => {
    slides.push($(el).attr('href') || '');
  });

  const result = {
    nickname,
    username,
    avatar,
    description,
    thumbnail,
    played,
    commented,
    saved,
    shared,
    song,
    video: {
      noWatermark,
      withWatermark,
    },
    audio,
    slides,
  };

  if (!audio) {
    return undefined;
  }

  const caption = `
${result.nickname} (${result.username})

${result.description}

▶️ ${result.played}
💬 ${result.commented}
🔖 ${result.saved}
🔗 ${result.shared}

🎶 ${result.song} 
  `.trim();

  return {
    caption,
    video: result.video ? result.video.noWatermark : undefined,
    audio: result.audio,
    slides: slides.length ? slides : undefined,
  };
};
