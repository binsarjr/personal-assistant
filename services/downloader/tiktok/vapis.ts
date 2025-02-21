import type { TiktokDlResult } from '$services/downloader/tiktok/tiktok';

type Ttdlv2 = {
  status: boolean;
  data: {
    type: string;
    uniqueId: string;
    nickname: string;
    profilePic: string;
    username: string;
    description: string;
    dlink: {
      nowm: string;
      wm: string;
      audio: string;
      profilePic: string;
      cover: string;
    };
    stats: {
      plays: string;
      likes: string;
      comments: string;
      shares: string;
    };
    songTitle: string;
    slides: Array<{
      number: number;
      url: string;
    }>;
    videoInfo?: {
      nowm: string;
      wm: string;
    };
  };
};

type Ttdlv = {
  status: boolean;
  data: {
    status: boolean;
    title: string;
    taken_at: string;
    region: string;
    id: string;
    durations: number;
    duration: string;
    cover: string;
    size_nowm: number;
    size_nowm_hd: number;
    data: Array<{
      type: string;
      url: string;
    }>;
    music_info: {
      id: string;
      title: string;
      author: string;
      album: string;
      url: string;
    };
    stats: {
      views: string;
      likes: string;
      comment: string;
      share: string;
      download: string;
    };
    author: {
      id: string;
      fullname: string;
      nickname: string;
      avatar: string;
    };
  };
};

export const ttdlv2 = async (
  url: string,
): Promise<TiktokDlResult | undefined> => {
  const target = new URL('https://vapis.my.id/api/ttdlv2');
  target.searchParams.append('url', url);
  const resp = await fetch(target);
  if (!resp.ok) return undefined;

  const data: Ttdlv2 = await resp.json();

  const caption = ` 
${data.data.nickname} (${data.data.username})

${data.data.description}

▶️ ${data.data.stats.plays}
💬 ${data.data.stats.comments}
🔖 ${data.data.stats.shares}
🔗 ${data.data.stats.likes}

🎶 ${data.data.songTitle}

        `
    .trim()
    .replace(/TiklyDown/gi, '');

  return {
    caption,
    audio: data.data.dlink.audio,
    video: data.data.videoInfo ? data.data.videoInfo.nowm : undefined,
    slides: data.data.slides.map((slide) => slide.url),
  };
};

export const ttdlv = async (
  url: string,
): Promise<TiktokDlResult | undefined> => {
  const target = new URL('https://vapis.my.id/api/ttdl');
  target.searchParams.append('url', url);
  const resp = await fetch(target);
  if (!resp.ok) {
    console.log(await resp.text());
    return undefined;
  }

  const { data }: Ttdlv = await resp.json();

  const caption = ` 
${data.author.fullname} (${data.author.nickname})

${data.title}

▶️ ${data.stats.views}
💬 ${data.stats.comment}
🔖 ${data.stats.share}
🔗 ${data.stats.likes}

🎶 ${data.music_info.title}

created at: ${data.taken_at}
        
        `
    .trim()
    .replace(/TiklyDown/gi, '');

  let video: string | undefined = undefined;
  let slides: string[] = [];

  data.data.forEach((item) => {
    if (item.type === 'nowatermark_hd') {
      video = item.url;
    } else if (item.type === 'nowatermark') {
      video = item.url;
    } else if (item.type === 'photo') {
      slides.push(item.url);
    }
  });

  return {
    caption,
    audio: data.data[0].url,
    video,
    slides: slides.length ? slides : undefined,
  };
};
