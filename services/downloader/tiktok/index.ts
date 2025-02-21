import { diioffc } from '$services/downloader/tiktok/diioffc';
import { nasirxml } from '$services/downloader/tiktok/nasirxml';
import { ssateam } from '$services/downloader/tiktok/ssateam';
import { tiklydown } from '$services/downloader/tiktok/tiklydown';
import { ttsave } from '$services/downloader/tiktok/ttsave';
import { ttdlv, ttdlv2 } from '$services/downloader/tiktok/vapis';

export const tiktokdl = {
  ttsave,
  tiklydown,
  ssateam,
  vapis: {
    ttdlv2,
    ttdlv,
  },
  nasirxml,
  diioffc,
};
