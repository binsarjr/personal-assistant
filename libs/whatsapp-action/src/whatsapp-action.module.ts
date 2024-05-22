import { AntiDeletedMessageAction } from '@app/whatsapp-action/always-executed/anti-deleted-message.action';
import { AntiViewOnceAction } from '@app/whatsapp-action/always-executed/anti-view-once.action';
import { DeleteSavedMessage } from '@app/whatsapp-action/always-executed/delete-saved-message.action';
import { SaveMessageAction } from '@app/whatsapp-action/always-executed/save-message.action';
import { AddMemberAction } from '@app/whatsapp-action/group/add-member.action';
import { DemoteMemberAction } from '@app/whatsapp-action/group/demote-member.action';
import { KickMemberAction } from '@app/whatsapp-action/group/kick-member.action';
import { MentionAdminAction } from '@app/whatsapp-action/group/mention-admin.action';
import { MentionAllAction } from '@app/whatsapp-action/group/mention-all.action';
import { MentionMemberAction } from '@app/whatsapp-action/group/mention-member.action';
import { PromoteMemberAction } from '@app/whatsapp-action/group/promote-member.action';
import { PingAction } from '@app/whatsapp-action/random/ping.action';
import { ScanQrCodeAction } from '@app/whatsapp-action/scan-qr-code.action';
import { ContactUpsertAction } from '@app/whatsapp-action/wa-event/contact-upsert.action';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    ScanQrCodeAction,
    PingAction,
    // ImgToStickerAction,
    // StickerToImgAction,
    // ConvertToHDAction,
    MentionAdminAction,
    MentionAllAction,
    MentionMemberAction,

    // group
    AddMemberAction,
    KickMemberAction,
    PromoteMemberAction,
    DemoteMemberAction,

    AntiViewOnceAction,
    SaveMessageAction,
    AntiDeletedMessageAction,

    DeleteSavedMessage,

    // downloader
    // InstagramDownloaderAction,
    // TiktokDownloaderAction,
    ContactUpsertAction,
  ],
})
export class WhatsappActionModule {}
