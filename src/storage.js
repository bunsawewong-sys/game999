// localStorage wrapper. Every access is guarded because storage can be
// unavailable (private mode, blocked site data).

const KEYS = {
  settings: 'fd.settings',
  name: 'fd.name',
  best: 'fd.best',
  localScores: 'fd.localScores',
};

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore: game still works without persistence
  }
}

const DEFAULT_SETTINGS = { sfx: 0.8, bgm: 0.5, lang: 'th' };

export const storage = {
  getSettings() {
    return { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) };
  },
  saveSettings(settings) {
    write(KEYS.settings, settings);
  },
  getName() {
    const name = read(KEYS.name, '');
    return typeof name === 'string' ? name : '';
  },
  saveName(name) {
    write(KEYS.name, name);
  },
  getBest() {
    const best = read(KEYS.best, 0);
    return Number.isFinite(best) ? best : 0;
  },
  saveBest(score) {
    write(KEYS.best, score);
  },
  getLocalScores() {
    const list = read(KEYS.localScores, []);
    return Array.isArray(list) ? list : [];
  },
  saveLocalScores(list) {
    write(KEYS.localScores, list);
  },
};
