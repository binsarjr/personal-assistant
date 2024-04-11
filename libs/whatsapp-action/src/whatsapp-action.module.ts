import { Module } from '@nestjs/common';
import { ConvertToHDAction } from './random/convert-to-hd.action';
import { ImgToStickerAction } from './random/img-to-sticker.action';
import { PingAction } from './random/ping.action';
import { StickerToImgAction } from './random/sticker-to-img.action';
import { ScanQrCodeAction } from './scan-qr-code.action';

@Module({
  providers: [
    ScanQrCodeAction,
    PingAction,
    ImgToStickerAction,
    StickerToImgAction,
    ConvertToHDAction,
  ],
})
export class WhatsappActionModule {}
