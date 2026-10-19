// Leaderboard client. Uses the online /api/scores endpoint when it is
// available and falls back to a per-device leaderboard otherwise (local dev,
// or before the Upstash database is connected).

import { storage } from '../storage.js';
import { nameKey } from '../../shared/validate.js';

const API = '/api/scores';
const TOP_N = 50;

async function request(url, options = {}, timeoutMs = 6000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = res.headers.get('content-type') ?? '';
    if (!type.includes('application/json')) throw new Error('not json');
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function localTop() {
  return storage
    .getLocalScores()
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N);
}

function localSubmit(name, score, wave) {
  const list = storage.getLocalScores();
  const key = nameKey(name);
  const existing = list.find((e) => nameKey(e.name) === key);
  if (!existing) list.push({ name, score, wave, ts: Date.now() });
  else if (score > existing.score) Object.assign(existing, { name, score, wave, ts: Date.now() });
  list.sort((a, b) => b.score - a.score);
  storage.saveLocalScores(list.slice(0, 200));
  const rank = list.findIndex((e) => nameKey(e.name) === key) + 1;
  return { rank, best: Math.max(score, existing?.score ?? 0) };
}

export async function fetchTop() {
  try {
    const data = await request(API);
    if (Array.isArray(data.top)) return { mode: 'online', top: data.top };
  } catch {
    // fall through to local
  }
  return { mode: 'local', top: localTop() };
}

export async function submitScore(name, score, wave) {
  try {
    const data = await request(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, score, wave }),
    });
    if (Number.isInteger(data.rank)) return { mode: 'online', rank: data.rank, best: data.best };
  } catch {
    // fall through to local
  }
  return { mode: 'local', ...localSubmit(name, score, wave) };
}
