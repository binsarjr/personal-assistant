import {
    AuthenticationState,
    useMultiFileAuthState,
} from '@whiskeysockets/baileys'
import { existsSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'

/**
 * Kelas Auth bertugas untuk melakukan proses autentikasi.
 * Kelas ini memerlukan folderAuth dan nama file sebagai parameter
 * ketika dibuat. File berada pada folderAuth/nama/nama.json.
 *
 * @param folderAuth - Lokasi folder yang menyimpan file autentikasi.
 * @param name - Nama file autentikasi.
 */
export class Auth {
  private processAuthState
  private state: AuthenticationState | null = null
  private _saveCreds: (() => Promise<void>) | null = null
  constructor(private folderAuth: string, private name: string) {
    folderAuth = dirname(join(folderAuth,name))
    !existsSync(folderAuth) && mkdirSync(folderAuth, { recursive: true })

    /**
     * Proses yang akan berjalan secara pararel lalu mengunggu prosesnya selesai ketika menggunakan method getState dan saveCreds
     */
    this.processAuthState = (async () => {
      const { state, saveCreds } = await useMultiFileAuthState(
        join(folderAuth, name),
      )
      this.state = state
      this._saveCreds = saveCreds
    })()
  }

  async execute() {
    const { state, saveCreds } = await useMultiFileAuthState(
      join(this.folderAuth, this.name),
    )
    this.state = state
    this._saveCreds = saveCreds
  }

  /**
   * getState() akan mengembalikan data autentikasi
   * setelah proses autentikasi selesai.
   *
   * @returns - Data autentikasi.
   */
  async getState() {
    // menunggu proses selesai baru datanya bisa diambil
    await this.processAuthState
    return this.state!
  }

  /**
   * saveCreds() akan menyimpan data autentikasi
   * setelah proses autentikasi selesai.
   *
   * @returns - Proses penyimpanan data.
   */
  async saveCreds() {
    // menunggu proses selesai baru datanya bisa diambil
    await this.processAuthState
    return this._saveCreds!()
  }
}
