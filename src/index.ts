import dotenv from 'dotenv'
import { WhatsappClient } from './Facades/WhatsappClient'
import { SetKesibukkan } from './Handler/Command/SetKesibukkan'
import { Halo } from './Handler/HaloHandler'
import { KickAllMember } from './Handler/KickAllMember'
import { checkStore } from './utils'
dotenv.config()
// import { HaloHandler } from './Handler/Halo'

checkStore()

const client = new WhatsappClient({
  name: 'testing',
})

const halo1 = new Halo()
halo1.participants = [process.env?.JID_DEV || '']

const kickmember = new KickAllMember()
kickmember.participants = [process.env?.JID_DEV || '']

client.addHandler(halo1)
client.addHandler(kickmember)
client.addHandler(new SetKesibukkan())
client.start()
