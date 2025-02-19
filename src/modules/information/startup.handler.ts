import { OnStartup, Socket, type SocketClient } from 'baileys-decorators';

export default class {
  @OnStartup()
  async startup(@Socket socket: SocketClient) {
    await socket.sendMessage(socket.user!.id, {
      text: `Bot sudah berjalan. Waktu mulai: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
    });
  }
}
