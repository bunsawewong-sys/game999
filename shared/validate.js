// Validation shared by the game client and the /api/scores function.

export const NAME_MIN = 3;
export const NAME_MAX = 12;
export const SCORE_MAX = 100_000_000;
export const WAVE_MAX = 9999;

const NAME_CHARS = /^[\p{Script=Thai}A-Za-z0-9 _-]+$/u;

export function normalizeName(raw) {
  return String(raw ?? '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();
}

// Returns { ok: true, name } or { ok: false, error: 'length' | 'chars' }.
export function validateName(raw) {
  const name = normalizeName(raw);
  const len = Array.from(name).length;
  if (len < NAME_MIN || len > NAME_MAX) return { ok: false, error: 'length' };
  if (!NAME_CHARS.test(name)) return { ok: false, error: 'chars' };
  return { ok: true, name };
}

export function validateScore(score, wave) {
  return (
    Number.isInteger(score) &&
    score >= 0 &&
    score <= SCORE_MAX &&
    Number.isInteger(wave) &&
    wave >= 1 &&
    wave <= WAVE_MAX
  );
}

// Leaderboard key: one entry per name, case-insensitive.
export function nameKey(name) {
  return normalizeName(name).toLowerCase();
}
