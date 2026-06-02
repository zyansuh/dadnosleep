import fs from 'node:fs';
import path from 'node:path';
import type { StoredUser } from './types';

const DEV_FILE = path.join(process.cwd(), 'data', 'users.json');

function binConfig() {
  const binId  = process.env.JSONBIN_USERS_BIN_ID || process.env.VITE_JSONBIN_USERS_BIN_ID;
  const binKey = process.env.JSONBIN_ACCESS_KEY || process.env.VITE_JSONBIN_ACCESS_KEY;
  return binId && binKey ? { binId, binKey } : null;
}

async function loadFromJsonBin(): Promise<StoredUser[] | null> {
  const cfg = binConfig();
  if (!cfg) return null;
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${cfg.binId}/latest`, {
      headers: { 'X-Access-Key': cfg.binKey },
    });
    if (!res.ok) return null;
    const json = await res.json() as { record?: StoredUser[] };
    return Array.isArray(json.record) ? json.record : [];
  } catch {
    return null;
  }
}

async function saveToJsonBin(users: StoredUser[]): Promise<boolean> {
  const cfg = binConfig();
  if (!cfg) return false;
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${cfg.binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': cfg.binKey,
      },
      body: JSON.stringify(users),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function loadFromFile(): StoredUser[] {
  try {
    if (!fs.existsSync(DEV_FILE)) return [];
    const raw = fs.readFileSync(DEV_FILE, 'utf-8');
    const data = JSON.parse(raw) as StoredUser[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveToFile(users: StoredUser[]): void {
  const dir = path.dirname(DEV_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DEV_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export async function loadUsers(): Promise<StoredUser[]> {
  const remote = await loadFromJsonBin();
  if (remote) return remote;
  return loadFromFile();
}

export async function saveUsers(users: StoredUser[]): Promise<void> {
  const saved = await saveToJsonBin(users);
  if (!saved) saveToFile(users);
}

export function isAdminEmail(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}
