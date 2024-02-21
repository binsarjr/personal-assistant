import dotenv from "dotenv";
import { gracefulShutdown } from "node-schedule";
import { WhatsappClient } from "./Facades/WhatsappClient";
import { AutoRevealOnceView } from "./Handler/AutoRevealOnceView";
import { ClearDataStore } from "./Handler/ClearDataStore";
import { CobaButton } from "./Handler/CobaButton";
import { BalasanTerimaKasih } from "./Handler/Command/BalasanTerimaKasih";
import { InstagramDownloader } from "./Handler/Command/Downloader/InstagramDownloader";
import { TiktokDownloader } from "./Handler/Command/Downloader/TiktokDownloader";
import { FindSecretMessageZeroWidthSpaceHandler } from "./Handler/Command/FindSecretMessageZeroWidthSpaceHandler";
import { LagiFree } from "./Handler/Command/LagiFree";
import { SetKesibukkan } from "./Handler/Command/SetKesibukkan";
import { AddMember } from "./Handler/Grup/AddMember";
import { DemoteAdmin } from "./Handler/Grup/DemoteAdmin";
import { KickMember } from "./Handler/Grup/KickMember";
import { PromoteMember } from "./Handler/Grup/PromoteMember";
import { TagAdmin } from "./Handler/Grup/TagAdmin";
import { TagAll } from "./Handler/Grup/TagAll";
import { TagMember } from "./Handler/Grup/TagMember";
import { Halo } from "./Handler/HaloHandler";
import { LagiDiChatHandler } from "./Handler/LagiDiChatHandler";
import { Ping } from "./Handler/Ping";
import {
	LihatProfile,
	LihatProfileTemplateButton,
} from "./Handler/TemplateButton/LihatProfile";
dotenv.config();
// import { HaloHandler } from './Handler/Halo'

const client = new WhatsappClient({
	name: "testing",
	useStore: false,
});

// hapus chat di database setiap 7 hari sekali
// const job = scheduleJob("Clear Chat", "0 7 * * */7", () =>
// 	client.clearDataStore()
// );

client.addHandler(new ClearDataStore(client));

client.addHandler(
	new Halo(),
	new LihatProfile(),
	new LihatProfileTemplateButton()
);
client.addHandler(new SetKesibukkan(), new LagiFree(), new LagiDiChatHandler());
// client.addHandler(new JanganManggilDoang());
client.addHandler(new BalasanTerimaKasih());
client.addHandler(new AutoRevealOnceView());
client.addHandler(
	new AddMember(),
	new KickMember(),
	// new KickAllMember(),
	new PromoteMember(),
	new DemoteAdmin()
);

client.addHandler(new TagAll(), new TagAdmin(), new TagMember());

client.addHandler(new TiktokDownloader(), new InstagramDownloader());

client.addHandler(new CobaButton(), new Ping());

client.addHandler(new FindSecretMessageZeroWidthSpaceHandler());
// client.addHandler(
//   new AutoDeleteWaSettingBug()
// )

client.start();
process.on("SIGINT", function () {
	gracefulShutdown().then(() => process.exit(0));
});
