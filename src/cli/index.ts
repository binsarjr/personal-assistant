import { exec } from 'child_process'
import minimist from 'minimist'
import { SessionManager } from './session-manager'

export interface CLIOptions {
  session?: string;
  mode?: 'qrcode' | 'pairing';
  phone?: string;
  interactive?: boolean;
  list?: boolean;
  help?: boolean;
}

export class CLI {
  private sessionManager = new SessionManager();

  public async run(): Promise<CLIOptions | null> {
    const args = minimist(process.argv.slice(2));
    
    // Parse arguments
    const options: CLIOptions = {
      session: args.session || args.s,
      mode: args.mode || args.m,
      phone: args.phone || args.p,
      interactive: args.interactive || args.i,
      list: args.list || args.l,
      help: args.help || args.h
    };

    // Show help
    if (options.help) {
      this.showHelp();
      return null;
    }

    // List sessions only
    if (options.list) {
      await this.sessionManager.displaySessions();
      return null;
    }

    // Interactive mode atau jika tidak ada session argument
    if (options.interactive || !options.session) {
      console.log('🚀 Personal Assistant - Interactive Setup');
      console.log('=' .repeat(50));
      
      while (true) {
        // Tampilkan daftar session terlebih dahulu
        await this.sessionManager.displaySessions();
        
        const action = await this.showMainMenu();
        if (!action) {
          return null;
        }

        if (action === 'create') {
          const newSession = await this.sessionManager.createSessionPrompt();
          if (!newSession) {
            console.log('❌ Gagal membuat session baru.');
            continue;
          }
          options.session = newSession;
          // Prompt untuk connection details untuk session baru
          const connectionDetails = await this.sessionManager.promptConnectionDetails();
          options.mode = connectionDetails.mode;
          options.phone = connectionDetails.phoneNumber;
          break;
        } else if (action === 'delete') {
          await this.sessionManager.deleteSessionPrompt();
          // Setelah hapus, kembali ke menu utama
          continue;
        } else if (action === 'select') {
          const selectedSession = await this.sessionManager.selectSession();
          if (!selectedSession) {
            console.log('❌ Tidak ada session yang dipilih. Keluar...');
            return null;
          }

          options.session = selectedSession;
          // Jika session belum valid, prompt untuk connection details
          const isValid = await this.sessionManager.validateSession(selectedSession);
          if (!isValid) {
            console.log(`\n⚠️  Session '${selectedSession}' belum memiliki kredensial.`);
            console.log('   Perlu setup koneksi WhatsApp terlebih dahulu.');
            const connectionDetails = await this.sessionManager.promptConnectionDetails();
            options.mode = connectionDetails.mode;
            options.phone = connectionDetails.phoneNumber;
          } else {
            console.log(`\n✅ Session '${selectedSession}' sudah siap digunakan.`);
            // Untuk session yang sudah valid, gunakan mode default
            options.mode = 'qrcode';
          }
          break;
        }
      }
    }

    // Validasi arguments
    if (!options.session) {
      console.error('❌ Session wajib dipilih!');
      this.showHelp();
      return null;
    }

    if (!options.mode) {
      console.error('❌ Mode koneksi wajib dipilih!');
      this.showHelp();
      return null;
    }

    if (options.mode === 'pairing' && !options.phone) {
      console.error('❌ Nomor telepon wajib diisi untuk mode pairing!');
      return null;
    }

    // Prompt untuk jalankan di PM2
    if (options.interactive) {
      await this.promptRunInPM2(options);
    }

    return options;
  }

  private async showMainMenu(): Promise<'select' | 'create' | 'delete' | null> {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n📋 Menu Utama:');
    console.log('1. 🔍 Pilih Session yang Ada');
    console.log('2. 🆕 Buat Session Baru');
    console.log('3. 🗑️  Hapus Session');
    console.log('4. ❌ Keluar');

    return new Promise((resolve) => {
      const askChoice = () => {
        rl.question('\n🎯 Pilih menu (1-4): ', (answer: string) => {
          const choice = answer.trim();
          
          switch (choice) {
            case '1':
              rl.close();
              resolve('select');
              break;
            case '2':
              rl.close();
              resolve('create');
              break;
            case '3':
              rl.close();
              resolve('delete');
              break;
            case '4':
              rl.close();
              resolve(null);
              break;
            default:
              console.log('❌ Pilihan tidak valid. Pilih 1-4.');
              askChoice();
              break;
          }
        });
      };

      askChoice();
    });
  }

  private showHelp(): void {
    console.log(`
🚀 Personal Assistant - WhatsApp Bot

Usage:
  bun run start [options]

Options:
  -s, --session <name>     Session name (required)
  -m, --mode <mode>        Connection mode: qrcode | pairing
  -p, --phone <number>     Phone number for pairing mode
  -i, --interactive        Interactive mode (default if no session)
  -l, --list               List all available sessions
  -h, --help               Show this help message

Examples:
  bun run start --interactive          # Interactive mode
  bun run start --list                 # List sessions
  bun run start -s mybot -m qrcode     # Direct mode with QR code
  bun run start -s mybot -m pairing -p +6281234567890  # Pairing mode

Interactive Mode:
  - Shows main menu with options to:
    * Select existing session
    * Create new session
    * Delete session
    * Exit
  - Prompts for connection details if needed
  - Perfect for first-time setup

PM2 Usage:
  pm2 start "bun run start -s mybot -m qrcode" --name "whatsapp-bot"
    `);
  }

  private async promptRunInPM2(options: CLIOptions): Promise<void> {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
      rl.question(`\n🚦 Jalankan session '${options.session}' di PM2? (y/n): `, (answer: string) => {
        rl.close();
        if (answer.trim().toLowerCase() === 'y') {
          this.runInPM2(options);
          // Exit CLI setelah menjalankan di PM2
          setTimeout(() => process.exit(0), 1000);
        }
        resolve();
      });
    });
  }

  private runInPM2(options: CLIOptions): void {
    let cmd = `pm2 start 'bun run start -s ${options.session} -m ${options.mode}`;
    if (options.mode === 'pairing' && options.phone) {
      cmd += ` -p ${options.phone}`;
    }
    cmd += `' --name 'wa-assitant-${options.session}'`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error('❌ Gagal menjalankan di PM2:', stderr);
      } else {
        console.log('✅ Berhasil dijalankan di PM2:\n', stdout);
        // Langsung tampilkan log PM2 untuk session ini
        const { spawn } = require('child_process');
        const logProc = spawn('pm2', ['logs', `wa-assitant-${options.session}`], { stdio: 'inherit' });
        logProc.on('close', (code: number) => {
          process.exit(code);
        });
      }
    });
  }
}

export async function runCLI(): Promise<CLIOptions | null> {
  const cli = new CLI();
  return await cli.run();
} 