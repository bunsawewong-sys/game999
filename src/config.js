// Shared constants: screen size, palette, fonts and gameplay balance.

export const GAME_W = 540;

// Height follows the phone's aspect ratio so tall screens are filled
// instead of letterboxed. Desktop (wide) windows clamp to 540x900.
export function computeGameHeight() {
  const w = window.innerWidth || GAME_W;
  const h = window.innerHeight || 960;
  const target = Math.round((GAME_W * h) / w);
  return Math.max(900, Math.min(1170, target));
}

// Size of one "art pixel" in game pixels.
export const PX = 3;

export const HEX = {
  bg: '#05070f',
  navy: '#0b1530',
  navy2: '#13213f',
  grid: '#0e1d3a',
  cyan: '#2de2e6',
  cyanDark: '#1b6f86',
  white: '#e8f6ff',
  gray: '#8fb4d9',
  grayDark: '#4a6080',
  red: '#ff3864',
  redDark: '#a01a3c',
  yellow: '#f9c80e',
  orange: '#ff7b00',
  green: '#3ddc84',
  greenDark: '#1f7a4a',
  purple: '#9b5de5',
  purpleDark: '#5a2d91',
};

export const COLOR = Object.fromEntries(
  Object.entries(HEX).map(([k, v]) => [k, parseInt(v.slice(1), 16)]),
);

export const FONT = {
  pixel: '"Press Start 2P", monospace',
  body: '"Chakra Petch", sans-serif',
};

export const BALANCE = {
  player: {
    maxHp: 100,
    damage: 10,
    fireInterval: 200, // ms between shots
    bulletSpeed: 720,
    magnetRange: 70,
    invulnMs: 800,
    hitRadius: 8,
  },
  dropChance: 0.07,
  // Wave 3, 6, 9... are boss waves.
  bossEvery: 3,
  waveSpawnMs: (wave) => 30000 + Math.min(wave, 12) * 1000,
  spawnIntervalMs: (wave) => Math.max(420, 1150 - wave * 70),
  enemyHpMult: (wave) => 1 + (wave - 1) * 0.18,
  enemySpeedMult: (wave) => 1 + Math.min(wave - 1, 15) * 0.035,
  enemyDamageMult: (wave) => 1 + (wave - 1) * 0.06,
  enemyFireMult: (wave) => Math.max(0.45, 1 - (wave - 1) * 0.04),
  bossHpMult: (wave) => 1 + (wave - 3) * 0.12,
  scoreMult: (wave) => 1 + (wave - 1) * 0.1,
  noHitBonus: (wave) => 200 * wave,
  powerupDurationMs: 9000,
};
