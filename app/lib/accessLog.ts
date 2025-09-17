import { promises as fs } from 'fs';
import path from 'path';

const ACCESS_LOG_PATH = process.env.ACCESS_LOG_PATH || path.join('data', 'log', 'access.csv');
let initialized = false;
let initPromise: Promise<void> | null = null;

export async function initFile() {
  if (initialized) return undefined;
  if (initPromise) return initPromise;

  const filePath = path.resolve(ACCESS_LOG_PATH);
  const dir = path.dirname(filePath);
  initPromise = (async () => {
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.access(filePath).catch(async () => {
        const header = 'email,access_time,ip_address\n';
        await fs.writeFile(filePath, header, { encoding: 'utf-8' });
      });
      initialized = true;
    } catch (e) {
      console.error('Failed to initialize access log file:', e);
    }
  })();

  return initPromise;
}

export async function access(email: string, ipAddress?: string) {
  await initFile();
  const filePath = path.resolve(ACCESS_LOG_PATH);

  const localTime = new Date().toLocaleString('zh-CN', {
    timeZone: process.env.TZ || 'Asia/Shanghai',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const esc = (v: string | null | undefined) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""').replace(/\r?\n/g, ' ');
    return '"' + s + '"';
  };

  const line = `${esc(email)},${esc(localTime)},${esc(ipAddress)}\n`;

  try {
    await fs.appendFile(filePath, line, { encoding: 'utf-8' });
    return true;
  } catch (e) {
    console.error('Failed to write access log:', e);
    return false;
  }
}
