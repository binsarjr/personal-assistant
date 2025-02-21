import {
  PREFIX_COMMAND,
  ReadMoreUnicode,
} from '$infrastructure/config/consts.config';
import { replaceRandomSpacesToUnicode } from '$support/string.support';
import type { WAMessage } from '@whiskeysockets/baileys';
import type { SocketClient } from 'baileys-decorators';
import { Context, OnText, Socket } from 'baileys-decorators';
import { $ } from 'bun';
import os from 'os';

export class PingHandler {
  @OnText(PREFIX_COMMAND + 'ping')
  async ping(@Socket socket: SocketClient, @Context message: WAMessage) {
    const totalMemory = os.totalmem();

    // Memori yang digunakan oleh sistem dalam bytes
    const usedMemory = totalMemory - os.freemem();

    const [serverInfo] = await Promise.all([this.getServerInformation()]);

    const textDisk: string[] = [];

    serverInfo.disk.map((disk) => {
      textDisk.push(
        `
*${disk.fs}*
Size: ${disk.size}
Used: ${disk.used}
Available: ${disk.available}
Capacity: ${disk.capacity}
Mount: ${disk.mount}


`.trim(),
      );
    });

    const text = `

    
${this.getPing(message.messageTimestamp! as number)}

*Hostname:* ${serverInfo.hostname}
*Uptime:* ${serverInfo.uptime}

*OS:* ${serverInfo.os.platform} ${serverInfo.os.type} ${
      serverInfo.os.release
    } ${serverInfo.os.arch}
*CPU:* ${serverInfo.cpu.model} ${serverInfo.cpu.speed} MHz ${
      serverInfo.cpu.cores
    } cores
*Virtual Memory:* ${this.bytesToGB(usedMemory)} / ${this.bytesToGB(
      totalMemory,
    )} (${Math.round((usedMemory / totalMemory) * 100)}%)

*Disk:* 
${textDisk.join('\n\n')}

      
      
      
              `.trim();
    socket.replyWithQuote({
      text: replaceRandomSpacesToUnicode(text),
    });
  }

  getPing(messageTimestamp: number) {
    const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });

    const timestamp = messageTimestamp.toString().padEnd(13, '0');
    const ping = Date.now() - (+timestamp || Date.now());
    return `Pong! ${rtf.format(
      +ping / 1_000,
      'seconds',
    )}\n${ReadMoreUnicode}\n`;
  }

  async getServerInformation() {
    const serverInfo: {
      hostname: string;
      uptime: string;
      os: {
        platform: string;
        type: string;
        release: string;
        arch: string;
      };
      cpu: {
        model: string;
        speed: number;
        cores: number;
      };
      memory: {
        total: number;
        free: number;
        used: number;
      };
      disk: {
        fs: string;
        size: string;
        used: string;
        available: string;
        capacity: string;
        mount: string;
      }[];
    } = {
      hostname: '',
      uptime: '',
      os: {
        platform: '',
        type: '',
        release: '',
        arch: '',
      },
      cpu: {
        model: '',
        speed: 0,
        cores: 0,
      },
      memory: {
        total: 0,
        free: 0,
        used: 0,
      },
      disk: [],
    };

    // Hostname
    serverInfo.hostname = os.hostname();

    // Uptime
    const uptime = os.uptime();
    serverInfo.uptime = `${Math.floor(uptime / 3600)} hours, ${Math.floor(
      (uptime % 3600) / 60,
    )} minutes`;

    // OS Information
    serverInfo.os = {
      platform: os.platform(),
      type: os.type(),
      release: os.release(),
      arch: os.arch(),
    };

    // CPU Information
    serverInfo.cpu = {
      model: os.cpus()[0].model,
      speed: os.cpus()[0].speed,
      cores: os.cpus().length,
    };

    // Memory Information
    serverInfo.memory = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
    };

    // Disk Information
    const diskSpace = await $`df -h`.text();

    const diskLines = diskSpace
      .split('\n')
      .filter((line: any) => line.startsWith('/'));
    serverInfo.disk = diskLines.map((line: any) => {
      const [fs, size, used, available, capacity, mount] = line.split(/\s+/);
      return {
        fs,
        size,
        used,
        available,
        capacity,
        mount,
      };
    });

    return serverInfo;
  }

  bytesToGB(bytes: number) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
}
