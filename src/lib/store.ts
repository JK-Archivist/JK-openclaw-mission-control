import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const dataDir = path.join(process.cwd(), 'data');
const USE_CONVEX = process.env.USE_CONVEX === '1';

async function ensureFile(file: string) {
  try {
    await fs.access(file);
  } catch {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify({ items: [] }, null, 2));
  }
}

export type Upsert<T extends { id?: string }> = T & { id?: string };

export async function upsertItem<T extends { id?: string }>(name: string, item: Upsert<T>): Promise<T & { id: string, updatedAt: string }>{
  if (USE_CONVEX) {
    console.warn('[store] USE_CONVEX=1 set — falling back to file store (stub).');
    // TODO: wire Convex mutations here; keep API stable
  }
  const file = path.join(dataDir, `${name}.json`);
  await ensureFile(file);
  const now = new Date().toISOString();
  const raw = await fs.readFile(file, 'utf8');
  const json = raw ? JSON.parse(raw) : { items: [] };
  const items: any[] = Array.isArray(json.items) ? json.items : [];
  let id = item.id ?? randomUUID();
  const idx = items.findIndex((x: any) => x.id === id);
  const record = { ...(items[idx] || {}), ...item, id, updatedAt: now };
  if (idx >= 0) items[idx] = record; else items.push(record);
  await fs.writeFile(file, JSON.stringify({ items }, null, 2));
  return record as any;
}

export async function listItems<T = any>(name: string): Promise<T[]> {
  if (USE_CONVEX) {
    console.warn('[store] USE_CONVEX=1 set — falling back to file store (stub).');
    // TODO: wire Convex queries here; keep API stable
  }
  const file = path.join(dataDir, `${name}.json`);
  await ensureFile(file);
  const raw = await fs.readFile(file, 'utf8');
  const json = raw ? JSON.parse(raw) : { items: [] };
  return Array.isArray(json.items) ? json.items : [];
}
