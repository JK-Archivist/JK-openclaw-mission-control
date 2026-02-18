#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import process from 'process';

async function loadCreds() {
  const p = path.join(process.env.HOME || '~', '.openclaw', 'credentials', 'mission-control.json');
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw);
}

async function main() {
  const [,, domain, action, jsonArg] = process.argv;
  if (!domain || !action || !jsonArg) {
    console.error('Usage: node bridge.mjs <domain> <action> <json>');
    process.exit(1);
  }
  const { baseUrl, token } = await loadCreds();
  const payload = JSON.parse(jsonArg);

  const map = {
    'tasks:upsert': '/tasks/upsert',
    'tasks:patchStatus': '/tasks/patchStatus',
    'content:upsert': '/content/upsert',
    'content:stage': '/content/stage',
    'memories:ingest': '/memories/ingest',
    'agents:upsert': '/agents/upsert',
    'subagents:upsert': '/subagents/upsert',
    'events:upsert': '/events/upsert',
    'activity:update': '/activity/update',
  };
  const key = `${domain}:${action}`;
  const pathSuffix = map[key];
  if (!pathSuffix) throw new Error('Unsupported command: ' + key);
  const url = baseUrl.replace(/\/$/, '') + pathSuffix;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error('Error:', res.status, text);
    process.exit(2);
  }
  console.log(text);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
