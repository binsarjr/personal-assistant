import type { TiktokDlResult } from '$services/downloader/tiktok/tiktok';

type NasirxmlTiktok = {
  creator: string;
  status: number;
  result: {
    id: number;
    title: string;
    url: string;
    created_at: string;
    stats: {
      likeCount: string;
      commentCount: number;
      shareCount: number;
      playCount: string;
      saveCount: number;
    };
    video?: {
      noWatermark: string;
      watermark: string;
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
    music: {
      id: number;
      title: string;
      author: string;
      cover_hd: string;
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
  };
};

const tiktok = async (url: string): Promise<TiktokDlResult | undefined> => {
  const target = new URL('https://api.nasirxml.my.id/api/tiktok');
  target.searchParams.append('urls', url);
  target.searchParams.append('apiKey', 'root');

  const resp = await fetch(target);
  if (!resp.ok) return undefined;

  const data: NasirxmlTiktok = await resp.json();
  if (!data.status) return undefined;
  const caption = `
${data.result.author.name} (${data.result.author.unique_id})

${data.result.title}

▶️ ${data.result.stats.playCount}
🤍 ${data.result.stats.likeCount}
💬 ${data.result.stats.commentCount}
🔖 ${data.result.stats.saveCount}
🔗 ${data.result.stats.shareCount}

🎶 ${data.result.music.title} (${data.result.music.author})

created at: ${data.result.created_at}
        
        `
    .trim()
    .replace(/TiklyDown/gi, '');

  return {
    caption,
    video: data.result.video ? data.result.video.noWatermark : undefined,
    audio: data.result.music.play_url,
    slides: data.result.images?.length
      ? data.result.images.map((image) => image.url)
      : undefined,
  };
};
type Tiktok2 = {
  creator: string;
  status: number;
  result: {
    videoId: string;
    cover: string;
    description: string;
    author: {
      username: string;
      nickname: string;
      avatar: string;
    };
    media: {
      images: Array<{
        url: string;
      }>;
      videos: Array<{
        type: string;
        format: string;
        size: string;
        url: string;
      }>;
      audios: Array<{
        type: string;
        format: string;
        title: string;
        url: string;
        converting: boolean;
      }>;
    };
  };
};

export const nasirxml = {
  tiktok,
};
