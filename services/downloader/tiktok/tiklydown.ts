import type { TiktokDlResult } from '$services/downloader/tiktok/tiktok';
import { getRandomUserAgent } from '$services/user-agent';

export type Tiklydown = {
  id: number;
  title: string;
  url: string;
  created_at: string;
  stats: {
    likeCount: number;
    commentCount: number;
    shareCount: number;
    playCount: string;
    saveCount: number;
  };
  music: {
    id: number;
    title: string;
    author: string;
    cover_hd: any;
    cover_large: string;
    cover_medium: string;
    cover_thumb: string;
    durationFormatted: string;
    duration: number;
    play_url: string;
  };
  author: {
    id: string;
    name: string;
    unique_id: string;
    signature: string;
    avatar: string;
    avatar_thumb: string;
  };

  video?: {
    noWatermark: string;
    cover: string;
    dynamic_cover: string;
    origin_cover: string;
    width: number;
    height: number;
    durationFormatted: string;
    duration: number;
    ratio: string;
  };
  images?: {
    url: string;
    width: number;
    height: number;
  }[];
};

export const tiklydown = async (
  url: string,
): Promise<TiktokDlResult | undefined> => {
  const target = new URL('https://api.tiklydown.eu.org/api/download');
  target.searchParams.append('url', url);

  const resp = await fetch(target, {
    headers: {
      'user-agent': getRandomUserAgent(),
      accept: 'application/json',
    },
  });

  if (!resp.ok) {
    return undefined;
  }

  const data: Tiklydown = await resp.json();
  const caption = `
${data.author.name} (${data.author.unique_id})

${data.title}

▶️ ${data.stats.playCount}
🤍 ${data.stats.likeCount}
💬 ${data.stats.commentCount}
🔖 ${data.stats.saveCount}
🔗 ${data.stats.shareCount}

🎶 ${data.music.title} (${data.music.author})

created at: ${data.created_at}
        
        `
    .trim()
    .replace(/TiklyDown/gi, '');

  return {
    caption,
    video: data.video ? data.video.noWatermark : undefined,
    audio: data.music.play_url,
    slides: data.images ? data.images.map((image) => image.url) : undefined,
  };
};
