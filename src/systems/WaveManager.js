import Phaser from 'phaser';
import { BALANCE } from '../config.js';
import { audio } from '../audio/AudioEngine.js';
import { t } from '../i18n.js';

const BOSS_SUB_KEYS = ['boss_ddos_sub', 'boss_ransom_sub', 'boss_botnet_sub'];

// Wave flow:
//   intro -> spawning -> clearing -> complete -> upgrade -> (next wave)
//   intro -> boss -> complete -> upgrade            (every 3rd wave)
export class WaveManager {
  constructor(scene) {
    this.scene = scene;
    this.state = 'idle';
  }

  get isBossWave() {
    return this.scene.wave % BALANCE.bossEvery === 0;
  }

  bossIndex() {
    return (this.scene.wave / BALANCE.bossEvery - 1) % 3;
  }

  bossLoop() {
    return Math.floor((this.scene.wave / BALANCE.bossEvery - 1) / 3);
  }

  nextWave() {
    const gs = this.scene;
    gs.wave += 1;
    gs.waveDamaged = false;
    gs.recalcDifficulty();
    this.state = 'intro';
    if (this.isBossWave) {
      this.timer = 2800;
      gs.hud.banner(t('warning'), t(BOSS_SUB_KEYS[this.bossIndex()]), 'danger');
      audio.play('warning');
      audio.playMusic('boss');
    } else {
      this.timer = 1700;
      gs.hud.banner(t('wave', { n: gs.wave }), t('getReady'));
      audio.playMusic('battle');
    }
  }

  update(delta) {
    const gs = this.scene;
    switch (this.state) {
      case 'intro':
        this.timer -= delta;
        if (this.timer > 0) break;
        if (this.isBossWave) {
          gs.spawnBoss(this.bossIndex(), this.bossLoop());
          this.state = 'boss';
        } else {
          this.state = 'spawning';
          this.elapsed = 0;
          this.spawnTimer = 300;
        }
        break;

      case 'spawning':
        this.elapsed += delta;
        this.spawnTimer -= delta;
        if (this.spawnTimer <= 0) {
          const cost = this.spawnPattern();
          this.spawnTimer = BALANCE.spawnIntervalMs(gs.wave) * cost;
        }
        if (this.elapsed >= BALANCE.waveSpawnMs(gs.wave)) {
          this.state = 'clearing';
          this.timer = 15000;
        }
        break;

      case 'clearing':
        this.timer -= delta;
        if (gs.enemies.countActive(true) === 0 || this.timer <= 0) this.complete();
        break;

      case 'complete':
        this.timer -= delta;
        if (this.timer <= 0) {
          this.state = 'upgrade';
          gs.openUpgrade();
        }
        break;

      default:
        break;
    }
  }

  complete() {
    this.state = 'complete';
    this.timer = 2000;
    this.scene.onWaveComplete();
  }

  upgradeDone() {
    this.nextWave();
  }

  // Spawns one random pattern and returns its relative cost, which scales
  // the delay before the next spawn.
  spawnPattern() {
    const gs = this.scene;
    const w = gs.wave;
    const table = [
      ['spam', 5, 1],
      ['spamRow', w >= 2 ? 1.6 : 0.6, 1.8],
      ['pingV', 2, 2.2],
      ['wormChain', w >= 2 ? 2 : 0, 2.6],
      ['trojan', w >= 4 ? 1.2 + w * 0.05 : 0, 1.6],
      ['virus', w >= 5 ? 1.6 : 0, 1.5],
    ];
    const total = table.reduce((s, [, weight]) => s + weight, 0);
    let r = Math.random() * total;
    let pick = table[0];
    for (const row of table) {
      r -= row[1];
      if (r <= 0) {
        pick = row;
        break;
      }
    }
    this[`spawn_${pick[0]}`]();
    return pick[2];
  }

  spawn_spam() {
    const W = this.scene.scale.width;
    this.scene.spawnEnemy('spam', Phaser.Math.Between(40, W - 40), -30, { vx: Phaser.Math.Between(-20, 20) });
  }

  spawn_spamRow() {
    const gs = this.scene;
    const W = gs.scale.width;
    const n = gs.wave >= 6 ? 4 : 3;
    const gap = 90;
    const x0 = Phaser.Math.Between(50, W - 50 - gap * (n - 1));
    for (let i = 0; i < n; i++) gs.spawnEnemy('spam', x0 + i * gap, -30);
  }

  spawn_pingV() {
    const gs = this.scene;
    const W = gs.scale.width;
    const x = Phaser.Math.Between(90, W - 90);
    const vx = Phaser.Math.Clamp((gs.player.x - x) * 0.3, -90, 90);
    const offsets = [
      [0, 0],
      [-34, -34],
      [34, -34],
      [-68, -68],
      [68, -68],
    ];
    for (const [ox, oy] of offsets) gs.spawnEnemy('ping', x + ox, -30 + oy, { vx });
  }

  spawn_wormChain() {
    const gs = this.scene;
    const W = gs.scale.width;
    const opts = {
      baseX: Phaser.Math.Between(120, W - 120),
      amp: Phaser.Math.Between(50, 95),
      freq: Phaser.Math.FloatBetween(2.2, 3.2),
      phase: Phaser.Math.FloatBetween(0, Math.PI * 2),
    };
    const x = opts.baseX + Math.sin(opts.phase) * opts.amp;
    for (let i = 0; i < 5; i++) {
      gs.time.delayedCall(i * 230, () => gs.spawnEnemy('worm', x, -30, opts));
    }
  }

  spawn_trojan() {
    const gs = this.scene;
    const { width: W, height: H } = gs.scale;
    gs.spawnEnemy('trojan', Phaser.Math.Between(60, W - 60), -30, {
      stopY: Phaser.Math.Between(Math.round(H * 0.14), Math.round(H * 0.32)),
    });
  }

  spawn_virus() {
    const W = this.scene.scale.width;
    this.scene.spawnEnemy('virus', Phaser.Math.Between(60, W - 60), -30);
  }
}
