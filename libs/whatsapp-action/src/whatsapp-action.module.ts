import { Module } from '@nestjs/common';
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
  ],
})
export class WhatsappActionModule {}
