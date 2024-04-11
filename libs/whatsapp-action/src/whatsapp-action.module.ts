import { Module } from '@nestjs/common';
import { ViewOnceAutoRevealAction } from './always-executed/view-once-reveal.action';
import { AddMemberAction } from './group/add-member.action';
import { DemoteMemberAction } from './group/demote-member.action';
import { KickMemberAction } from './group/kick-member.action';
import { MentionAdminAction } from './group/mention-admin.action';
import { MentionAllAction } from './group/mention-all.action';
import { MentionMemberAction } from './group/mention-member.action';
import { PromoteMemberAction } from './group/promote-member.action';
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
    MentionAdminAction,
    MentionAllAction,
    MentionMemberAction,

    // group
    AddMemberAction,
    KickMemberAction,
    PromoteMemberAction,
    DemoteMemberAction,

    ViewOnceAutoRevealAction,
  ],
})
export class WhatsappActionModule {}
