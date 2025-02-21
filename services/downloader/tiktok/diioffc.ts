import type { TiktokDlResult } from '$services/downloader/tiktok/tiktok';

type Root = {
  status: boolean;
  creator: string;
  result: {
    id: string;
    region: string;
    title: string;
    cover: string;
    ai_dynamic_cover: string;
    origin_cover: string;
    duration: number;
    play: string;
    wmplay: string;
    hdplay: string;
    size: number;
    wm_size: number;
    hd_size: number;
    music: string;
    music_info: {
      id: string;
      title: string;
      play: string;
      cover: string;
      author: string;
      original: boolean;
      duration: number;
      album: string;
    };
    play_count: number;
    digg_count: number;
    comment_count: number;
    share_count: number;
    download_count: number;
    collect_count: number;
    create_time: number;
    anchors: any;
    anchors_extras: string;
    is_ad: boolean;
    commerce_info: {
      adv_promotable: boolean;
      auction_ad_invited: boolean;
      branded_content_type: number;
      with_comment_filter_words: boolean;
    };
    commercial_video_info: string;
    item_comment_settings: number;
    mentioned_users: string;
    author: {
      id: string;
      unique_id: string;
      nickname: string;
      avatar: string;
    };
    images?: Array<string>;
  };
};

export const diioffc = async (url: string): Promise<TiktokDlResult> => {
  const target = new URL('https://api.diioffc.web.id/api/tiktok');
  target.searchParams.append('url', url);
  const resp = await fetch(target);
  if (!resp.ok) return undefined;

  const data: Root = await resp.json();
  const caption = `
${data.result.author.nickname} (${data.result.author.unique_id})

${data.result.title}

▶️ ${data.result.play_count}
🤍 ${data.result.digg_count}
💬 ${data.result.comment_count}
🔖 ${data.result.download_count}
🔗 ${data.result.share_count}

🎶 ${data.result.music_info.title} (${data.result.music_info.author})

created at: ${new Date(data.result.create_time * 1000).toLocaleString()}
        `
    .trim()
    .replace(/TiklyDown/gi, '');

  return {
    caption,
    video: data.result?.images?.length ? undefined : data.result.hdplay,
    audio: data.result.music,
    slides: data.result.images?.length
      ? data.result.images.map((image) => image)
      : undefined,
  };
};
