import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'fs'
import { parsePhoneNumber } from 'libphonenumber-js'
import { join } from 'path'

export interface SessionDetail {
  id: string;
  name: string;
  path: string;
  lastModified: Date;
  hasAuthStore: boolean;
  hasCredentials: boolean;
  isValid: boolean;
  size: number;
  status: 'active' | 'inactive' | 'corrupted';
}

export class SessionManager {
  private readonly sessionBaseDir = '.hiddens';

  /**
   * Mendapatkan semua session yang tersedia
   */
  public async getAllSessions(): Promise<SessionDetail[]> {
    try {
      if (!existsSync(this.sessionBaseDir)) {
        return [];
      }

      const sessions = readdirSync(this.sessionBaseDir)
        .filter(name => {
          const sessionPath = join(this.sessionBaseDir, name);
          return statSync(sessionPath).isDirectory() && !name.startsWith('.');
        })
        .map(sessionId => this.getSessionDetail(sessionId))
        .filter(Boolean) as SessionDetail[];

      return sessions.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    } catch (error) {
      console.error('Error reading sessions:', error);
      return [];
    }
  }

  /**
   * Mendapatkan detail session berdasarkan ID
   */
  public getSessionDetail(sessionId: string): SessionDetail | null {
    try {
      const sessionPath = join(this.sessionBaseDir, sessionId);
      const authStorePath = join(sessionPath, 'auth-store');
      
      if (!existsSync(sessionPath)) {
        return null;
      }

      const stats = statSync(sessionPath);
      const hasAuthStore = existsSync(authStorePath);
      const hasCredentials = hasAuthStore && existsSync(join(authStorePath, 'creds.json'));
      
      // Hitung ukuran folder
      const size = this.calculateFolderSize(sessionPath);
      
      // Tentukan status
      let status: 'active' | 'inactive' | 'corrupted' = 'inactive';
      if (hasCredentials) {
        status = 'active';
      } else if (hasAuthStore) {
        status = 'corrupted';
      }

      return {
        id: sessionId,
        name: sessionId,
        path: sessionPath,
        lastModified: stats.mtime,
        hasAuthStore,
        hasCredentials,
        isValid: hasCredentials,
        size,
        status
      };
    } catch (error) {
      console.error(`Error getting session detail for ${sessionId}:`, error);
      return null;
    }
  }

  /**
   * Menampilkan daftar session dengan detail
   */
  public async displaySessions(): Promise<void> {
    const sessions = await this.getAllSessions();
    
    if (sessions.length === 0) {
      console.log('📭 Tidak ada session yang ditemukan.');
      console.log('   Buat session baru dengan menjalankan aplikasi menggunakan --session <nama>');
      return;
    }

    console.log('📱 Daftar Session WhatsApp:');
    console.log('=' .repeat(80));
    
    sessions.forEach((session, index) => {
      const statusIcon = this.getStatusIcon(session.status);
      const sizeStr = this.formatSize(session.size);
      const dateStr = session.lastModified.toLocaleString('id-ID');
      
      console.log(`${index + 1}. ${statusIcon} ${session.name}`);
      console.log(`   📁 Path: ${session.path}`);
      console.log(`   📅 Last Modified: ${dateStr}`);
      console.log(`   💾 Size: ${sizeStr}`);
      console.log(`   🔐 Auth Store: ${session.hasAuthStore ? '✅' : '❌'}`);
      console.log(`   🔑 Credentials: ${session.hasCredentials ? '✅' : '❌'}`);
      console.log(`   📊 Status: ${this.getStatusText(session.status)}`);
      console.log('   ' + '-'.repeat(70));
    });
  }

  /**
   * Interactive session selection
   */
  public async selectSession(): Promise<string | null> {
    const sessions = await this.getAllSessions();
    
    if (sessions.length === 0) {
      return null;
    }

    // Tidak perlu display sessions lagi karena sudah ditampilkan di awal
    // await this.displaySessions();
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      const askSelection = () => {
        rl.question(
          `\n🔍 Pilih session (1-${sessions.length}) atau 'q' untuk quit: `,
          (answer: string) => {
            const trimmed = answer.trim().toLowerCase();
            
            if (trimmed === 'q' || trimmed === 'quit') {
              rl.close();
              resolve(null);
              return;
            }

            const index = parseInt(trimmed) - 1;
            if (index >= 0 && index < sessions.length) {
              const selectedSession = sessions[index];
              console.log(`\n✅ Session dipilih: ${selectedSession.name}`);
              rl.close();
              resolve(selectedSession.id);
            } else {
              console.log('❌ Pilihan tidak valid. Coba lagi.');
              askSelection();
            }
          }
        );
      };

      askSelection();
    });
  }

  /**
   * Validasi session
   */
  public async validateSession(sessionId: string): Promise<boolean> {
    const session = this.getSessionDetail(sessionId);
    return session?.isValid ?? false;
  }

  /**
   * Prompt untuk mode dan phone number
   */
  public async promptConnectionDetails(): Promise<{
    mode: 'qrcode' | 'pairing';
    phoneNumber?: string;
  }> {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      const askMode = () => {
        rl.question(
          '\n🔗 Pilih mode koneksi:\n1. QR Code\n2. Pairing Code\nPilih (1/2): ',
          (answer: string) => {
            const choice = answer.trim();
            
            if (choice === '1') {
              rl.close();
              resolve({ mode: 'qrcode' });
            } else if (choice === '2') {
              askPhoneNumber();
            } else {
              console.log('❌ Pilihan tidak valid. Pilih 1 atau 2.');
              askMode();
            }
          }
        );
      };

      const askPhoneNumber = () => {
        rl.question(
          '\n📞 Masukkan nomor telepon (contoh: +6281234567890): ',
          (answer: string) => {
            const phone = answer.trim();
            
            try {
              const parsed = parsePhoneNumber(phone);
              if (parsed.isValid()) {
                rl.close();
                resolve({ mode: 'pairing', phoneNumber: parsed.number });
              } else {
                console.log('❌ Nomor tidak valid. Coba lagi.');
                askPhoneNumber();
              }
            } catch (e) {
              console.log('❌ Format nomor tidak valid. Coba lagi.');
              askPhoneNumber();
            }
          }
        );
      };

      askMode();
    });
  }

  /**
   * Prompt untuk membuat session baru
   */
  public async createSessionPrompt(): Promise<string | null> {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    return new Promise((resolve) => {
      rl.question('\n🆕 Masukkan nama session baru: ', async (answer: string) => {
        const sessionId = answer.trim();
        if (!sessionId) {
          console.log('❌ Nama session tidak boleh kosong.');
          rl.close();
          resolve(null);
          return;
        }
        const sessionPath = join(this.sessionBaseDir, sessionId);
        if (existsSync(sessionPath)) {
          console.log('❌ Session sudah ada. Pilih nama lain.');
          rl.close();
          resolve(null);
          return;
        }
        try {
          mkdirSync(sessionPath, { recursive: true });
          console.log(`✅ Session '${sessionId}' berhasil dibuat.`);
          rl.close();
          resolve(sessionId);
        } catch (e) {
          console.log('❌ Gagal membuat session:', (e as Error).message);
          rl.close();
          resolve(null);
        }
      });
    });
  }

  /**
   * Prompt untuk menghapus session
   */
  public async deleteSessionPrompt(): Promise<string | null> {
    const sessions = await this.getAllSessions();
    if (sessions.length === 0) {
      console.log('📭 Tidak ada session yang bisa dihapus.');
      return null;
    }
    // Tidak perlu displaySessions lagi karena sudah ditampilkan di awal
    // await this.displaySessions();
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise((resolve) => {
      rl.question(`\n🗑️ Pilih session yang ingin dihapus (1-${sessions.length}) atau 'q' untuk batal: `, (answer: string) => {
        const trimmed = answer.trim().toLowerCase();
        if (trimmed === 'q' || trimmed === 'quit') {
          rl.close();
          resolve(null);
          return;
        }
        const index = parseInt(trimmed) - 1;
        if (index >= 0 && index < sessions.length) {
          const selectedSession = sessions[index];
          try {
            rmSync(selectedSession.path, { recursive: true, force: true });
            console.log(`✅ Session '${selectedSession.name}' berhasil dihapus.`);
            rl.close();
            resolve(selectedSession.id);
          } catch (e) {
            console.log('❌ Gagal menghapus session:', (e as Error).message);
            rl.close();
            resolve(null);
          }
        } else {
          console.log('❌ Pilihan tidak valid.');
          rl.close();
          resolve(null);
        }
      });
    });
  }

  private calculateFolderSize(folderPath: string): number {
    try {
      let totalSize = 0;
      const files = readdirSync(folderPath);
      
      for (const file of files) {
        const filePath = join(folderPath, file);
        const stats = statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += this.calculateFolderSize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  private formatSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  private getStatusIcon(status: 'active' | 'inactive' | 'corrupted'): string {
    switch (status) {
      case 'active': return '🟢';
      case 'inactive': return '🔴';
      case 'corrupted': return '🟡';
      default: return '⚪';
    }
  }

  private getStatusText(status: 'active' | 'inactive' | 'corrupted'): string {
    switch (status) {
      case 'active': return '🟢 Active (Ready to use)';
      case 'inactive': return '🔴 Inactive (No credentials)';
      case 'corrupted': return '🟡 Corrupted (Incomplete auth)';
      default: return '⚪ Unknown';
    }
  }
} 