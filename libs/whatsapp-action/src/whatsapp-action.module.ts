import { GeminiToolsModule } from '@app/gemini-tools';
import { AntiDeletedMessageAction } from '@app/whatsapp-action/always-executed/anti-deleted-message.action';
import { AntiViewOnceAction } from '@app/whatsapp-action/always-executed/anti-view-once.action';
import { DeleteSavedMessage } from '@app/whatsapp-action/always-executed/delete-saved-message.action';
import { SaveMessageAction } from '@app/whatsapp-action/always-executed/save-message.action';
import { TiktokDownloaderAction } from '@app/whatsapp-action/downloader/tiktok-downloader.action';
import { AddMemberAction } from '@app/whatsapp-action/group/add-member.action';
import { DemoteMemberAction } from '@app/whatsapp-action/group/demote-member.action';
import { KickMemberAction } from '@app/whatsapp-action/group/kick-member.action';
import { MentionAdminAction } from '@app/whatsapp-action/group/mention-admin.action';
import { MentionAllAction } from '@app/whatsapp-action/group/mention-all.action';
import { MentionMemberAction } from '@app/whatsapp-action/group/mention-member.action';
import { PromoteMemberAction } from '@app/whatsapp-action/group/promote-member.action';
import { TurnOffAction } from '@app/whatsapp-action/group/turn-off.action';
import { TurnOnAction } from '@app/whatsapp-action/group/turn-on.action';
import { PingAction } from '@app/whatsapp-action/random/ping.action';
import { SendStoryAction } from '@app/whatsapp-action/random/send-story.action';
import { ScanQrCodeAction } from '@app/whatsapp-action/scan-qr-code.action';
import { DexScreenerAction } from '@app/whatsapp-action/trades/dexscreener.action';
import { ContactUpsertAction } from '@app/whatsapp-action/wa-event/contact-upsert.action';
import { Module } from '@nestjs/common';
import { AiGeminiProofReaderAction } from './ai/ai-gemini-copywriting.action';
import { AiGeminiAction } from './ai/ai-gemini.action';
import { AiLearnGeminiAction } from './ai/ai-learn-gemini.action';
import { ExtractPhoneNumber } from './group/extract-phoneNumber.action';
import { ImgToStickerAction } from './random/img-to-sticker.action';
import { StickerToImgAction } from './random/sticker-to-img.action';

@Module({
  providers: [
    ScanQrCodeAction,
    PingAction,
    ImgToStickerAction,
    StickerToImgAction,
    // ConvertToHDAction,
    MentionAdminAction,
    MentionAllAction,
    MentionMemberAction,

    // group
    AddMemberAction,
    KickMemberAction,
    PromoteMemberAction,
    DemoteMemberAction,

    ExtractPhoneNumber,

    AntiViewOnceAction,
    SaveMessageAction,
    AntiDeletedMessageAction,

    DeleteSavedMessage,

    // downloader
    // InstagramDownloaderAction,
    TiktokDownloaderAction,
    ContactUpsertAction,
    SendStoryAction,

    TurnOnAction,
    TurnOffAction,

    AiGeminiAction,
    AiLearnGeminiAction,
    AiGeminiProofReaderAction,
    DexScreenerAction,
  ],
  imports: [GeminiToolsModule],
})
export class WhatsappActionModule {}
