import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler, { getTop, submit } from '../api/scores.js';
import { validateName, validateScore } from '../shared/validate.js';

// Minimal in-memory stand-in for the @upstash/redis client methods we use.
class FakeRedis {
  constructor() {
    this.z = new Map();
    this.h = new Map();
  }
  async zadd(key, opts, { score, member }) {
    const cur = this.z.get(member);
    if (cur === undefined || (opts.gt && score > cur)) {
      this.z.set(member, score);
      return 1;
    }
    return 0;
  }
  sorted() {
    return [...this.z.entries()].sort((a, b) => b[1] - a[1]);
  }
  async zrange(key, start, stop) {
    return this.sorted()
      .slice(start, stop + 1)
      .flatMap(([m, s]) => [m, s]);
  }
  async zrevrank(key, member) {
    const i = this.sorted().findIndex(([m]) => m === member);
    return i < 0 ? null : i;
  }
  async zscore(key, member) {
    return this.z.get(member) ?? null;
  }
  async hset(key, obj) {
    for (const [k, v] of Object.entries(obj)) this.h.set(k, v);
  }
  async hmget(key, ...fields) {
    return Object.fromEntries(fields.map((f) => [f, this.h.get(f) ?? null]));
  }
}

test('validateName accepts Thai/English and rejects bad input', () => {
  assert.deepEqual(validateName('  กอล์ฟ  '), { ok: true, name: 'กอล์ฟ' });
  assert.deepEqual(validateName('Golf_99'), { ok: true, name: 'Golf_99' });
  assert.equal(validateName('ab').ok, false);
  assert.equal(validateName('a'.repeat(13)).ok, false);
  assert.equal(validateName('<script>').error, 'chars');
});

test('validateScore checks integer ranges', () => {
  assert.equal(validateScore(1234, 5), true);
  assert.equal(validateScore(-1, 5), false);
  assert.equal(validateScore(1.5, 5), false);
  assert.equal(validateScore(100, 0), false);
});

test('submit keeps the best score per name (case-insensitive)', async () => {
  const redis = new FakeRedis();
  let r = await submit(redis, { name: 'Golf', score: 500, wave: 3 });
  assert.equal(r.status, 200);
  assert.equal(r.json.rank, 1);

  await submit(redis, { name: 'Alice', score: 900, wave: 5 });
  r = await submit(redis, { name: 'golf', score: 300, wave: 2 });
  assert.equal(r.json.best, 500);
  assert.equal(r.json.improved, false);
  assert.equal(r.json.rank, 2);

  r = await submit(redis, { name: 'GOLF', score: 1200, wave: 7 });
  assert.equal(r.json.rank, 1);
  assert.equal(r.json.improved, true);

  const top = await getTop(redis);
  assert.deepEqual(top, [
    { name: 'GOLF', score: 1200, wave: 7 },
    { name: 'Alice', score: 900, wave: 5 },
  ]);
});

test('submit rejects invalid payloads', async () => {
  const redis = new FakeRedis();
  assert.equal((await submit(redis, { name: 'x', score: 1, wave: 1 })).status, 400);
  assert.equal((await submit(redis, { name: 'Golf', score: '99', wave: 1 })).status, 400);
  assert.equal((await submit(redis, null)).status, 400);
});

test('handler returns 503 when the database is not configured', async () => {
  delete process.env.KV_REST_API_URL;
  delete process.env.UPSTASH_REDIS_REST_URL;
  const res = {
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  await handler({ method: 'GET' }, res);
  assert.equal(res.code, 503);
  assert.equal(res.body.error, 'not_configured');
});
