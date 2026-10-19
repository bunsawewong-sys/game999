// Power-ups dropped by enemies. Timed ones last BALANCE.powerupDurationMs
// multiplied by the player's Lease Time bonus.

import { COLOR } from '../config.js';

export const POWERUPS = {
  multicast: { tex: 'pu_multicast', color: COLOR.cyan, timed: true, weight: 3 },
  laser: { tex: 'pu_laser', color: COLOR.red, timed: true, weight: 2 },
  shield: { tex: 'pu_shield', color: COLOR.purple, timed: true, weight: 2 },
  patch: { tex: 'pu_patch', color: COLOR.green, timed: false, weight: 3 },
  qos: { tex: 'pu_qos', color: COLOR.yellow, timed: true, weight: 3 },
};

export const TIMED_POWERUPS = Object.keys(POWERUPS).filter((k) => POWERUPS[k].timed);

export function rollPowerup(hpRatio) {
  const entries = Object.entries(POWERUPS).map(([id, p]) => [
    id,
    id === 'patch' && hpRatio < 0.5 ? p.weight * 2.5 : p.weight,
  ]);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [id, w] of entries) {
    r -= w;
    if (r <= 0) return id;
  }
  return 'patch';
}
