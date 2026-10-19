// All pixel art is defined here as text rows and turned into textures at
// boot, so the game ships without any image files.
//
// Each character is one art pixel; '.' is transparent. Small sprites are
// drawn by hand, bosses are drawn with a few shape helpers.

import { HEX, PX } from '../config.js';

const PALETTE = {
  K: HEX.bg,
  B: HEX.navy2,
  b: HEX.navy,
  C: HEX.cyan,
  c: HEX.cyanDark,
  W: HEX.white,
  S: HEX.gray,
  s: HEX.grayDark,
  R: HEX.red,
  r: HEX.redDark,
  Y: HEX.yellow,
  O: HEX.orange,
  G: HEX.green,
  g: HEX.greenDark,
  P: HEX.purple,
  p: HEX.purpleDark,
};

// ---- hand-drawn sprites -------------------------------------------------

const PLAYER_BODY = [
  '.......C.......',
  '......CWC......',
  '......CWC......',
  '.....cCWCc.....',
  '.....cCCCc.....',
  '....cCRORCc....',
  '...ccCOYOCcc...',
  '..cCCCRORCCCc..',
  '.cCWCCCCCCCWCc.',
  'cCCCcCCCCCcCCCc',
  'cCCc.cCCCc.cCCc',
  'cCc..cCRCc..cCc',
];

const PLAYER_FLAME_A = ['cc...cRYRc...cc', '......RYR......', '.......R.......'];
const PLAYER_FLAME_B = ['cc...cRORc...cc', '......ROR......', '...............'];

const SPRITES = {
  player0: [...PLAYER_BODY, ...PLAYER_FLAME_A],
  player1: [...PLAYER_BODY, ...PLAYER_FLAME_B],

  drone: ['.cCc.', 'cCWCc', 'CWYWC', 'cCWCc', '.c.c.'],

  bullet: ['.W.', 'WWW', 'CWC', 'CCC', 'cCc', '.c.'],
  laser: ['.W.', 'RWR', 'RWR', 'RWR', 'RWR', 'RRR', 'rRr', 'rRr', '.r.'],

  ebullet: ['.R.', 'RWR', '.R.'],
  ebulletBig: ['.RR.', 'RWWR', 'RWWR', '.RR.'],
  ebulletPurple: ['.PP.', 'PWWP', 'PWWP', '.PP.'],
  ebulletGreen: ['.G.', 'GWG', '.G.'],

  spam: [
    'OOOOOOOOOOO',
    'OOYYYYYYYOO',
    'OYOYYYYYOYO',
    'OYYOYYYOYYO',
    'OYYYOYOYYYO',
    'OYYYYOYYYYO',
    'OYYYYYYYYYO',
    'OYYYYYYYYYO',
    'OOOOOOOOOOO',
  ],

  ping: [
    'R.....R',
    'RR...RR',
    'RWR.RWR',
    '.RWRWR.',
    '..RWR..',
    '..RRR..',
    '...R...',
  ],

  worm: [
    '..PPPPP..',
    '.PWWPWWP.',
    'PPWKPWKPP',
    'PPPPPPPPP',
    'PpPPPPPpP',
    '.pPRRRPp.',
    '..pPPPp..',
    '...p.p...',
  ],

  trojanSafe: [
    '.GGGGGGGGG.',
    'GGGGGGGGGGG',
    'GGGGGGGGWGG',
    'GGGGGGGWWGG',
    'GGWGGGWWGGG',
    'GGWWGWWGGGG',
    'GGGWWWGGGGG',
    '.GGGWGGGGG.',
    '..GGGGGGG..',
    '...GGgGG...',
    '....GGG....',
  ],

  trojan: [
    '.RRRRRRRRR.',
    'RRrrrrrrrRR',
    'RrWWRRRWWrR',
    'RrWKRRRKWrR',
    'RrRRRRRRRrR',
    'RRrRRRRRrRR',
    'RRRrWRWrRRR',
    '.RRRWRWRRR.',
    '..RRRRRRR..',
    '...RRrRR...',
    '....RRR....',
  ],

  virus: [
    '.....O.....',
    '.O...Y...O.',
    '..OYYYYYO..',
    '..YYYYYYY..',
    '.YYKYYYKYY.',
    'OYYYYYYYYYO',
    '.YYYRRRYYY.',
    '..YYYYYYY..',
    '..OYYYYYO..',
    '.O...Y...O.',
    '.....O.....',
  ],

  virusSmall: ['...O...', '.OYYYO.', '.YKYKY.', 'OYYYYYO', '.YRRRY.', '.OYYYO.', '...O...'],

  botNode: [
    '.....W.....',
    '.....s.....',
    '...sssss...',
    '..sSSSSSs..',
    '.sSSRRRSSs.',
    '.sSRRWRRSs.',
    '.sSSRRRSSs.',
    '..sSSSSSs..',
    '...sssss...',
    '..s.....s..',
    '.s.......s.',
  ],

  pu_multicast: [
    '.CCCCCCC.',
    'CbbbWbbbC',
    'CbWbWbWbC',
    'CWbbWbbWC',
    'CbbbWbbbC',
    'CbbbWbbbC',
    'CbbWWWbbC',
    'CbbbbbbbC',
    '.CCCCCCC.',
  ],
  pu_laser: [
    '.RRRRRRR.',
    'RbbbWbbbR',
    'RbbbWbbbR',
    'RbbRWRbbR',
    'RbbRWRbbR',
    'RbbRWRbbR',
    'RbbbRbbbR',
    'RbbbbbbbR',
    '.RRRRRRR.',
  ],
  pu_shield: [
    '.PPPPPPP.',
    'PbbbbbbbP',
    'PbWWWWWbP',
    'PbWCCCWbP',
    'PbWCCCWbP',
    'PbbWCWbbP',
    'PbbbWbbbP',
    'PbbbbbbbP',
    '.PPPPPPP.',
  ],
  pu_patch: [
    '.GGGGGGG.',
    'GbbbbbbbG',
    'GbbbWbbbG',
    'GbbbWbbbG',
    'GbWWWWWbG',
    'GbbbWbbbG',
    'GbbbWbbbG',
    'GbbbbbbbG',
    '.GGGGGGG.',
  ],
  pu_qos: [
    '.YYYYYYY.',
    'YbbbbWWbY',
    'YbbbWWbbY',
    'YbbWWbbbY',
    'YbWWWWWbY',
    'YbbbWWbbY',
    'YbbWWbbbY',
    'YbbWbbbbY',
    '.YYYYYYY.',
  ],

  // Upgrade card icons (7x7)
  up_dpi: ['..WWW..', '.W...W.', 'W..R..W', 'W.RRR.W', 'W..R..W', '.W...WW', '..WWW.W'],
  up_gigabit: ['...YY..', '..YY...', '.YY....', 'YYYYYY.', '...YY..', '..YY...', '.YY....'],
  up_redundancy: ['.RR.RR.', 'RRRRRRR', 'RRWRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'],
  up_latency: ['...C...', '..CCC..', '.C.C.C.', '...C...', '...C...', '...C...', '...C...'],
  up_loadbal: ['C.....C', 'C..W..C', 'CC.W.CC', '..WWW..', '.WWWWW.', 'WW.W.WW', 'W.....W'],
  up_tunnel: ['.......', 'SSS.SSS', 'S.S.S.S', 'CCCCCCC', 'S.S.S.S', 'SSS.SSS', '.......'],
  up_autodisc: ['...G...', '.G.G.G.', '..GGG..', 'GGGWGGG', '..GGG..', '.G.G.G.', '...G...'],
  up_zeroday: ['..RRR..', '.R...R.', 'R.R.R.R', 'R.....R', '.R.R.R.', '..RRR..', '.R.R.R.'],
  up_selfheal: ['...G...', '...G...', '.GGGGG.', '...G...', '.W.G.W.', 'W.....W', '.WWWWW.'],
  up_lease: ['.SSSSS.', 'S..W..S', 'S..W..S', 'S..WWWS', 'S.....S', 'S.....S', '.SSSSS.'],

  bit0: ['WWW', 'W.W', 'W.W', 'W.W', 'WWW'],
  bit1: ['.W.', 'WW.', '.W.', '.W.', 'WWW'],

  px: ['W'],
};

// ---- shape helpers for larger sprites ------------------------------------

function makeGrid(w, h) {
  return Array.from({ length: h }, () => new Array(w).fill('.'));
}

function put(g, x, y, ch) {
  x = Math.round(x);
  y = Math.round(y);
  if (y >= 0 && y < g.length && x >= 0 && x < g[0].length) g[y][x] = ch;
}

function disc(g, cx, cy, r, ch, filter = () => true) {
  for (let y = 0; y < g.length; y++) {
    for (let x = 0; x < g[0].length; x++) {
      const d2 = (x - cx) ** 2 + (y - cy) ** 2;
      if (d2 <= r * r + r * 0.6 && filter(x, y)) g[y][x] = ch;
    }
  }
}

function ring(g, cx, cy, r, ch, filter = () => true) {
  for (let y = 0; y < g.length; y++) {
    for (let x = 0; x < g[0].length; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= r + 0.5 && d > r - 0.5 && filter(x, y)) g[y][x] = ch;
    }
  }
}

function rect(g, x0, y0, w, h, ch) {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) put(g, x, y, ch);
}

function line(g, x0, y0, x1, y1, ch) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    put(g, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, ch);
  }
}

const toRows = (g) => g.map((r) => r.join(''));

function drawDDoS() {
  const g = makeGrid(35, 31);
  const cx = 17;
  const cy = 15;
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i + Math.PI / 8;
    line(g, cx + Math.cos(a) * 10, cy + Math.sin(a) * 10, cx + Math.cos(a) * 15, cy + Math.sin(a) * 15, 'r');
    put(g, cx + Math.cos(a) * 15, cy + Math.sin(a) * 15, 'R');
  }
  disc(g, cx, cy, 12, 'r');
  disc(g, cx, cy, 11, 'R');
  disc(g, cx, cy, 8, 'O');
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i;
    put(g, cx + Math.cos(a) * 9.6, cy + Math.sin(a) * 9.6, 'K');
  }
  disc(g, cx, cy, 6, 'Y');
  disc(g, cx, cy, 4, 'W');
  disc(g, cx, cy, 2, 'K');
  put(g, cx - 1, cy - 1, 'R');
  ring(g, cx, cy, 13, 'r', (x, y) => (x + y) % 3 === 0);
  return toRows(g);
}

function drawRansomware() {
  const g = makeGrid(37, 34);
  const cx = 18;
  // Shackle
  ring(g, cx, 12, 9, 'S', (x, y) => y <= 12);
  ring(g, cx, 12, 8, 'S', (x, y) => y <= 12);
  ring(g, cx, 12, 10, 's', (x, y) => y <= 12);
  rect(g, cx - 10, 12, 3, 4, 'S');
  rect(g, cx + 8, 12, 3, 4, 'S');
  // Claws
  rect(g, 0, 18, 4, 3, 'R');
  rect(g, 1, 24, 3, 3, 'R');
  rect(g, 33, 18, 4, 3, 'R');
  rect(g, 33, 24, 3, 3, 'R');
  // Body
  rect(g, 4, 15, 29, 19, 'p');
  rect(g, 5, 16, 27, 17, 'P');
  rect(g, 5, 16, 27, 1, 'W');
  // Keyhole
  disc(g, cx, 22, 3, 'K');
  rect(g, cx - 1, 23, 3, 6, 'K');
  put(g, cx, 21, 'R');
  // Hazard stripes
  for (let x = 5; x < 32; x++) {
    for (let y = 30; y < 33; y++) put(g, x, y, (x + y) % 4 < 2 ? 'Y' : 'K');
  }
  return toRows(g);
}

function drawBotnet() {
  const g = makeGrid(41, 28);
  const cx = 20;
  // Antenna
  rect(g, cx, 1, 1, 5, 'S');
  put(g, cx, 0, 'R');
  line(g, cx - 4, 3, cx, 5, 's');
  line(g, cx + 4, 3, cx, 5, 's');
  // Dome
  disc(g, cx, 12, 8, 'g', (x, y) => y <= 12);
  disc(g, cx, 12, 7, 'G', (x, y) => y <= 12);
  put(g, cx - 3, 7, 'W');
  put(g, cx - 4, 8, 'W');
  // Wings
  rect(g, 0, 13, 4, 7, 'g');
  rect(g, 1, 14, 2, 5, 'G');
  rect(g, 37, 13, 4, 7, 'g');
  rect(g, 38, 14, 2, 5, 'G');
  // Body
  rect(g, 3, 11, 35, 13, 's');
  rect(g, 4, 12, 33, 11, 'B');
  for (let x = 6; x <= 34; x += 3) {
    put(g, x, 14, 'G');
    put(g, x, 20, x % 2 === 0 ? 'R' : 'G');
  }
  // Core eye
  disc(g, cx, 17, 3, 'R');
  disc(g, cx, 17, 1, 'W');
  // Thrusters
  rect(g, 8, 24, 5, 2, 's');
  rect(g, 28, 24, 5, 2, 's');
  rect(g, 9, 26, 3, 2, 'O');
  rect(g, 29, 26, 3, 2, 'O');
  put(g, 10, 27, 'Y');
  put(g, 30, 27, 'Y');
  return toRows(g);
}

function drawShieldRing(r, ch, dash) {
  const size = r * 2 + 3;
  const g = makeGrid(size, size);
  const c = (size - 1) / 2;
  ring(g, c, c, r, ch);
  ring(g, c, c, r - 1, dash, (x, y) => (x + y) % 2 === 0);
  return toRows(g);
}

SPRITES.bossDDoS = drawDDoS();
SPRITES.bossRansom = drawRansomware();
SPRITES.bossBotnet = drawBotnet();
SPRITES.playerShield = drawShieldRing(11, 'P', 'C');
SPRITES.ransomShield = drawShieldRing(22, 'C', 'c');

// ---- texture generation ---------------------------------------------------

export function generateTextures(scene) {
  for (const [key, data] of Object.entries(SPRITES)) {
    if (scene.textures.exists(key)) continue;
    scene.textures.generate(key, { data, pixelWidth: PX, palette: PALETTE });
  }

  // Background grid tile
  if (!scene.textures.exists('gridTile')) {
    const size = 60;
    const gfx = scene.make.graphics({ x: 0, y: 0 }, false);
    gfx.fillStyle(0x05070f, 1).fillRect(0, 0, size, size);
    gfx.fillStyle(0x0c1832, 1);
    gfx.fillRect(0, 0, size, 2);
    gfx.fillRect(0, 0, 2, size);
    gfx.fillStyle(0x16305c, 1).fillRect(0, 0, 4, 4);
    gfx.generateTexture('gridTile', size, size);
    gfx.destroy();
  }
}
