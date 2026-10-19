// Vercel Serverless Function: GET returns the top 50, POST submits a score.
// Storage is an Upstash Redis sorted set holding each name's best score.
//
// Env vars are added automatically when Upstash Redis is connected to the
// project in the Vercel dashboard (KV_REST_API_URL / KV_REST_API_TOKEN).
// UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN also work.

import { Redis } from '@upstash/redis';
import { validateName, validateScore, nameKey } from '../shared/validate.js';

const SCORES_KEY = 'fd:scores';
const META_KEY = 'fd:meta';
const TOP_N = 50;

let client;

export function getRedis(env = process.env) {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  client ??= new Redis({ url, token });
  return client;
}

export async function getTop(redis) {
  const flat = await redis.zrange(SCORES_KEY, 0, TOP_N - 1, { rev: true, withScores: true });
  const rows = [];
  for (let i = 0; i < flat.length; i += 2) rows.push({ key: String(flat[i]), score: Number(flat[i + 1]) });
  if (rows.length === 0) return [];
  const meta = (await redis.hmget(META_KEY, ...rows.map((r) => r.key))) ?? {};
  return rows.map((r) => {
    const m = meta[r.key] ?? {};
    return { name: m.name ?? r.key, score: r.score, wave: m.wave ?? 0 };
  });
}

export async function submit(redis, body) {
  const nameCheck = validateName(body?.name);
  const score = body?.score;
  const wave = body?.wave;
  if (!nameCheck.ok || !validateScore(score, wave)) return { status: 400, json: { error: 'invalid' } };

  const key = nameKey(nameCheck.name);
  // GT: only replace the stored score when the new one is higher.
  const changed = await redis.zadd(SCORES_KEY, { gt: true, ch: true }, { score, member: key });
  if (changed) {
    await redis.hset(META_KEY, { [key]: { name: nameCheck.name, wave, ts: Date.now() } });
  }
  const [rank, best] = await Promise.all([redis.zrevrank(SCORES_KEY, key), redis.zscore(SCORES_KEY, key)]);
  return { status: 200, json: { rank: Number(rank) + 1, best: Number(best), improved: Boolean(changed) } };
}

function parseBody(req) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return req.body ?? null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const redis = getRedis();
  if (!redis) return res.status(503).json({ error: 'not_configured' });

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ top: await getTop(redis) });
    }
    if (req.method === 'POST') {
      const result = await submit(redis, parseBody(req));
      return res.status(result.status).json(result.json);
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('scores api error', err);
    return res.status(500).json({ error: 'server_error' });
  }
}
