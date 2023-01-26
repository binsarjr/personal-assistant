import dotenv from 'dotenv'
import { WhatsappClient } from './Facades/WhatsappClient'
import { CobaButton } from './Handler/CobaButton'
import { BalasanTerimaKasih } from './Handler/Command/BalasanTerimaKasih'
import { JanganManggilDoang } from './Handler/Command/JanganManggilDoang'
import { LagiFree } from './Handler/Command/LagiFree'
import { SetKesibukkan } from './Handler/Command/SetKesibukkan'
import { AddMember } from './Handler/Grup/AddMember'
import { DemoteAdmin } from './Handler/Grup/DemoteAdmin'
import { KickAllMember } from './Handler/Grup/KickAllMember'
import { KickMember } from './Handler/Grup/KickMember'
import { PromoteMember } from './Handler/Grup/PromoteMember'
import { Halo } from './Handler/HaloHandler'
import { LagiDiChatHandler } from './Handler/LagiDiChatHandler'
import {
  LihatProfile,
  LihatProfileTemplateButton,
} from './Handler/TemplateButton/LihatProfile'
import { checkStore } from './utils'
dotenv.config()
// import { HaloHandler } from './Handler/Halo'
checkStore()

const client = new WhatsappClient({
  name: 'testing',
})

client.addHandler(
  new Halo(),
  new LihatProfile(),
  new LihatProfileTemplateButton(),
)
client.addHandler(new SetKesibukkan(), new LagiFree(), new LagiDiChatHandler())
client.addHandler(new JanganManggilDoang())
client.addHandler(new BalasanTerimaKasih())
client.addHandler(
  new AddMember(),
  new KickMember(),
  new KickAllMember(),
  new PromoteMember(),
  new DemoteAdmin(),
)

client.addHandler(new CobaButton())
client.start()
