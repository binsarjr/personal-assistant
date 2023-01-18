import dotenv from 'dotenv'
import { WhatsappClient } from './Facades/WhatsappClient'
import { Halo } from './Handler/HaloHandler'
dotenv.config()
// import { HaloHandler } from './Handler/Halo'

const client = new WhatsappClient({
  name: 'testing',
})

const halo1 = new Halo()
halo1.participants = [process.env?.JID_DEV || '']

client.addHandler(halo1)
client.start()
