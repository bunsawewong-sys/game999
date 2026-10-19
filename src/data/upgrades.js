// Upgrade cards offered after each wave (pick 1 of 3).
// Name/description text lives in i18n under up_<id> and up_<id>_desc.

export const UPGRADES = [
  { id: 'dpi', max: 5, apply: (s) => (s.damageMult += 0.3) },
  { id: 'gigabit', max: 5, apply: (s) => (s.fireRateMult += 0.2) },
  {
    id: 'redundancy',
    max: 5,
    apply: (s, player) => {
      s.maxHp += 25;
      player.heal(25);
    },
  },
  { id: 'latency', max: 3, apply: (s) => (s.bulletSpeedMult += 0.25) },
  { id: 'loadbal', max: 2, apply: (s) => (s.sideGuns += 1) },
  { id: 'tunnel', max: 3, apply: (s) => (s.pierce += 1) },
  { id: 'autodisc', max: 3, apply: (s) => (s.magnetMult += 0.6) },
  { id: 'zeroday', max: 5, apply: (s) => (s.critChance += 0.1) },
  { id: 'selfheal', max: 3, apply: (s) => (s.waveHeal += 20) },
  { id: 'lease', max: 3, apply: (s) => (s.powerupDurMult += 0.4) },
];

export function rollUpgrades(levels, count = 3) {
  const pool = UPGRADES.filter((u) => (levels[u.id] ?? 0) < u.max);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
