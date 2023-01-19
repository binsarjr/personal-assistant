import { isJidUser } from '@adiwajshing/baileys'
import { WAEvent } from '../WaEvent'

export abstract class MessageEvent extends WAEvent {
  /**
   * Jika onlyMe bernilai true maka handler hanya akan diproses apabila
   * pesan yang masuk berasal dari saya sendiri(whatsapp session logged)
   */
  onlyMe: boolean = false
  /**
   * Jika participant tidak undefined maka pesan / handler hanya akan berpengaruh
   * terhadap list dari participant yang ada
   */
  participants: string[] | undefined
  /**
   * Mengambil daftar partisipan dan menambah domain "@s.whatsapp.net" jika tidak
   * ada.
   *
   * @returns daftar partisipan dengan domain yang benar.
   */
  public getParticipants() {
    if (!this.participants?.length) return []
    return this.participants.map((participant) => {
      if (!participant.includes('@'))
        participant = `${participant}@s.whatsapp.net`
      if (!isJidUser(participant)) throw new Error('JID user tidak valid')
      return participant
    })
  }
}
