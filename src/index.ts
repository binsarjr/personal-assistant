import dotenv from 'dotenv'
import { WhatsappClient } from './Facades/WhatsappClient'
import { LagiFree } from './Handler/Command/LagiFree'
import { SetKesibukkan } from './Handler/Command/SetKesibukkan'
import { Halo } from './Handler/HaloHandler'
import { LagiDiChatHandler } from './Handler/LagiDiChatHandler'
import { checkStore } from './utils'
dotenv.config()
// import { HaloHandler } from './Handler/Halo'
checkStore()

const client = new WhatsappClient({
  name: 'testing',
})

client.addHandler(new Halo())
client.addHandler(new SetKesibukkan())
client.addHandler(new LagiFree())
client.addHandler(new LagiDiChatHandler())
client.start()
