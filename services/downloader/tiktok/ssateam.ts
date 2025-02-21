import type { TiktokDlResult } from '$services/downloader/tiktok/tiktok';

export type SSATeamTiktok = {
  creator: string;
  data: {
    music: {
      author: string;
      url: string;
      title: string;
    };
    author: {
      avatar: string;
      username: string;
      name: string;
    };
    status: string;
    content: {
      video?: string;
      images?: string[];
    };
  };
};

export const ssateam = async (
  url: string,
): Promise<TiktokDlResult | undefined> => {
  const target = new URL('https://api.ssateam.my.id/api/tiktok');

  target.searchParams.append('urls', url);
  target.searchParams.append('apiKey', 'root');

  const resp = await fetch(target);
  if (!resp.ok) return undefined;

  const data: SSATeamTiktok = await resp.json();
  const caption = `
${data.data.author.name} (${data.data.author.username})

${data.data.status.replace(/s\s{0,}/gi, '\n')}

🎶 ${data.data.music.author} - ${data.data.music.title}

`.trim();

  return {
    caption,
    video: data?.data?.content?.video ? data.data.content.video : undefined,
    audio: data?.data?.music?.url,
    slides: data?.data?.content?.images ? data.data.content.images : undefined,
  };
};
