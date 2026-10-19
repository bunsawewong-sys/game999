import Phaser from 'phaser';
import { BALANCE, COLOR, FONT, HEX } from '../config.js';
import { audio } from '../audio/AudioEngine.js';
import { t } from '../i18n.js';
import { Background } from '../ui/Background.js';
import { Player } from '../objects/Player.js';
import { PlayerBullet, EnemyBullet } from '../objects/Bullets.js';
import { Enemy } from '../objects/Enemy.js';
import { Pickup } from '../objects/Pickup.js';
import { BOSS_CLASSES } from '../objects/Bosses.js';
import { WaveManager } from '../systems/WaveManager.js';
import { POWERUPS, TIMED_POWERUPS, rollPowerup } from '../data/powerups.js';
import { UPGRADES, rollUpgrades } from '../data/upgrades.js';

const DRAG_SENSITIVITY = 1.25;
const KEY_SPEED = 460;
const PITY_MS = 25000; // force a drop if none for this long

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    const { width: W, height: H } = this.scale;
    this.W = W;
    this.H = H;

    this.score = 0;
    this.wave = 0;
    this.levels = {};
    this.powerups = {}; // id -> ms remaining
    this.boss = null;
    this.gameEnded = false;
    this.waveDamaged = false;
    this.fireTimer = 0;
    this.pityTimer = 0;
    this.emitters = {};
    this.recalcDifficulty();

    this.bg = new Background(this);

    this.playerBullets = this.physics.add.group({ classType: PlayerBullet, maxSize: 260 });
    this.enemyBullets = this.physics.add.group({ classType: EnemyBullet, maxSize: 500 });
    this.enemies = this.physics.add.group({ classType: Enemy, maxSize: 150 });
    this.pickups = this.physics.add.group({ classType: Pickup, maxSize: 24 });
    this.bosses = this.physics.add.group();
    this.player = new Player(this, W / 2, H - 170);

    this.physics.add.overlap(this.playerBullets, this.enemies, (b, e) => this.onBulletHitEnemy(b, e));
    this.physics.add.overlap(this.playerBullets, this.bosses, (b, boss) => this.onBulletHitBoss(b, boss));
    this.physics.add.overlap(this.player, this.enemyBullets, (p, b) => this.onPlayerHitByBullet(b));
    this.physics.add.overlap(this.player, this.enemies, (p, e) => this.onPlayerTouchEnemy(e));
    this.physics.add.overlap(this.player, this.bosses, () => this.hurtPlayer(30));
    this.physics.add.overlap(this.player, this.pickups, (p, item) => this.onPickup(item));

    this.setupInput();

    this.waves = new WaveManager(this);
    this.scene.launch('Hud');
    this.hud = this.scene.get('Hud');

    this.onVisibility = () => {
      if (document.hidden) this.openPause();
    };
    document.addEventListener('visibilitychange', this.onVisibility);
    this.events.once('shutdown', () => document.removeEventListener('visibilitychange', this.onVisibility));
    this.events.on('resume', () => {
      this.dragId = null;
    });

    audio.playMusic('battle');
    this.time.delayedCall(250, () => this.waves.nextWave());
  }

  recalcDifficulty() {
    const w = Math.max(1, this.wave);
    this.hpMult = BALANCE.enemyHpMult(w);
    this.speedMult = BALANCE.enemySpeedMult(w);
    this.enemyDmgMult = BALANCE.enemyDamageMult(w);
    this.fireMult = BALANCE.enemyFireMult(w);
    this.bulletSpeedMult = 1 + Math.min(w - 1, 15) * 0.02;
    this.bossHpMult = BALANCE.bossHpMult(Math.max(w, 3));
    this.scoreMult = BALANCE.scoreMult(w);
  }

  // ---- input ---------------------------------------------------------------

  setupInput() {
    this.dragId = null;
    this.input.on('pointerdown', (p) => {
      this.dragId = p.id;
      this.lastPointer = { x: p.x, y: p.y };
    });
    this.input.on('pointermove', (p) => {
      if (p.id !== this.dragId || !p.isDown || !this.player.alive || this.gameEnded) return;
      const dx = (p.x - this.lastPointer.x) * DRAG_SENSITIVITY;
      const dy = (p.y - this.lastPointer.y) * DRAG_SENSITIVITY;
      this.lastPointer = { x: p.x, y: p.y };
      this.movePlayer(this.player.x + dx, this.player.y + dy);
    });
    const release = (p) => {
      if (p.id === this.dragId) this.dragId = null;
    };
    this.input.on('pointerup', release);
    this.input.on('pointerupoutside', release);

    this.keys = this.input.keyboard?.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,ESC,P');
    this.input.keyboard?.on('keydown-ESC', () => this.openPause());
    this.input.keyboard?.on('keydown-P', () => this.openPause());
  }

  movePlayer(x, y) {
    this.player.setPosition(
      Phaser.Math.Clamp(x, 24, this.W - 24),
      Phaser.Math.Clamp(y, this.H * 0.28, this.H - 36),
    );
  }

  updateKeyboard(delta) {
    const k = this.keys;
    if (!k || !this.player.alive) return;
    let vx = 0;
    let vy = 0;
    if (k.LEFT.isDown || k.A.isDown) vx -= 1;
    if (k.RIGHT.isDown || k.D.isDown) vx += 1;
    if (k.UP.isDown || k.W.isDown) vy -= 1;
    if (k.DOWN.isDown || k.S.isDown) vy += 1;
    if (vx || vy) {
      const d = (KEY_SPEED * delta) / 1000 / Math.hypot(vx, vy);
      this.movePlayer(this.player.x + vx * d, this.player.y + vy * d);
    }
  }

  // ---- main loop -----------------------------------------------------------

  update(time, rawDelta) {
    const delta = Math.min(rawDelta, 50);
    this.bg.update(delta, this.boss ? 1.8 : 1);
    if (this.gameEnded) return;

    this.updateKeyboard(delta);

    for (const id of TIMED_POWERUPS) {
      if (this.powerups[id] > 0) {
        this.powerups[id] -= delta;
        if (this.powerups[id] <= 0) delete this.powerups[id];
      }
    }
    this.player.setShield(this.powerups.shield > 0);

    this.updateFiring(delta);
    this.pityTimer += delta;
    this.waves.update(delta);
  }

  updateFiring(delta) {
    const p = this.player;
    if (!p.alive) return;
    const s = p.stats;
    const rate = s.fireRateMult * (this.powerups.qos > 0 ? 2 : 1);
    const interval = Math.max(55, BALANCE.player.fireInterval / rate);
    this.fireTimer -= delta;
    if (this.fireTimer > 0) return;
    this.fireTimer = Math.max(this.fireTimer + interval, interval * 0.5);

    const laser = this.powerups.laser > 0;
    const speed = BALANCE.player.bulletSpeed * s.bulletSpeedMult * (laser ? 1.25 : 1);
    const spreads = this.powerups.multicast > 0 ? [-0.2, 0, 0.2] : [0];
    for (const a of spreads) {
      this.firePlayerBullet(p.x + a * 50, p.y - 24, -Math.PI / 2 + a, speed, 1, laser);
    }
    for (const d of p.drones) this.firePlayerBullet(d.x, d.y - 10, -Math.PI / 2, speed, 0.6, laser);
    audio.play(laser ? 'laser' : 'shoot');
  }

  firePlayerBullet(x, y, angle, speed, dmgFactor, laser) {
    const s = this.player.stats;
    const crit = Math.random() < s.critChance;
    const dmg = BALANCE.player.damage * s.damageMult * dmgFactor * (crit ? 2 : 1) * (laser ? 0.9 : 1);
    const b = this.playerBullets.get();
    if (b) b.fire(x, y, angle, speed, dmg, laser ? 99 : s.pierce, crit, laser);
  }

  // ---- spawning helpers (used by WaveManager, enemies and bosses) -----------

  spawnEnemy(kind, x, y, opts) {
    const e = this.enemies.get();
    return e ? e.spawn(kind, x, y, opts) : null;
  }

  fireEnemyBullet(x, y, angle, speed, tex = 'ebullet', dmg = 10) {
    const b = this.enemyBullets.get();
    if (b) b.fire(x, y, angle, speed * this.bulletSpeedMult, tex, dmg);
  }

  fireAtPlayer(x, y, speed, tex, dmg, spreads = [0]) {
    const a = Phaser.Math.Angle.Between(x, y, this.player.x, this.player.y);
    for (const s of spreads) this.fireEnemyBullet(x, y, a + s, speed, tex, dmg);
    audio.play('enemyShoot');
  }

  spawnBoss(index, loop) {
    const Cls = BOSS_CLASSES[index];
    this.boss = new Cls(this, loop);
    this.bosses.add(this.boss);
    this.hud.showBoss(this.boss);
  }

  spawnPickup(kind, x, y) {
    const p = this.pickups.get();
    if (p) p.spawn(kind, x, y);
  }

  // ---- collisions ------------------------------------------------------------

  onBulletHitEnemy(b, e) {
    if (!b.active || !e.active || b.hitSet.has(e.uid)) return;
    b.hitSet.add(e.uid);
    const killed = e.damage(b.damage);
    this.spark(b.x, b.y, b.crit ? COLOR.yellow : COLOR.white, 3);
    audio.play('hit');
    if (killed) this.killEnemy(e);
    if (b.pierce > 0) b.pierce -= 1;
    else b.disableBody(true, true);
  }

  onBulletHitBoss(b, boss) {
    if (!b.active || !boss.active) return;
    const result = boss.takeDamage(b.damage);
    if (result === 'blocked') {
      this.spark(b.x, b.y, COLOR.cyan, 4);
      audio.play('block');
    } else {
      this.spark(b.x, b.y, b.crit ? COLOR.yellow : COLOR.white, 3);
      audio.play('hit');
    }
    b.disableBody(true, true);
  }

  onPlayerHitByBullet(b) {
    if (!b.active) return;
    if (this.hurtPlayer(b.damage) !== 'ignored') b.disableBody(true, true);
  }

  onPlayerTouchEnemy(e) {
    if (!e.active) return;
    const result = this.hurtPlayer(e.def.contact);
    if (result !== 'ignored' && e.kind !== 'botNode') this.killEnemy(e);
  }

  onPickup(item) {
    if (!item.active || !this.player.alive) return;
    item.disableBody(true, true);
    this.applyPowerup(item.kind);
  }

  // Damage values are base values; wave scaling is applied here.
  // Returns 'ignored' | 'blocked' | 'hit'.
  hurtPlayer(baseAmount) {
    const p = this.player;
    if (!p.alive || this.gameEnded || p.invuln > 0) return 'ignored';
    if (this.powerups.shield > 0) {
      audio.play('block');
      this.spark(p.x, p.y - 10, COLOR.purple, 6);
      p.invuln = 150;
      return 'blocked';
    }
    p.hp -= Math.round(baseAmount * this.enemyDmgMult);
    p.invuln = BALANCE.player.invulnMs;
    this.waveDamaged = true;
    this.cameras.main.shake(140, 0.008);
    audio.play('hurt');
    this.hud.flashDamage();
    if (p.hp <= 0) {
      p.hp = 0;
      this.playerDeath();
    }
    return 'hit';
  }

  // ---- kills, drops, power-ups ------------------------------------------------

  addScore(n) {
    this.score += Math.round(n);
  }

  killEnemy(e) {
    const def = e.def;
    this.addScore(def.score * this.scoreMult);
    this.explode(e.x, e.y, def.color, e.kind === 'virusSmall' || e.kind === 'ping' ? 10 : 16);
    audio.play('explode');
    this.maybeDrop(e.x, e.y, def.drop);
    if (e.kind === 'virus') {
      for (const vx of [-110, 110]) this.spawnEnemy('virusSmall', e.x, e.y, { vx, vy: 130 });
    }
    if (e.kind === 'botNode') e.opts.boss?.onNodeKilled(e.opts.slot);
    e.disableBody(true, true);
  }

  maybeDrop(x, y, mult) {
    if (Math.random() < BALANCE.dropChance * mult || this.pityTimer > PITY_MS) {
      this.pityTimer = 0;
      this.spawnPickup(rollPowerup(this.player.hp / this.player.stats.maxHp), x, y);
    }
  }

  applyPowerup(kind) {
    const p = this.player;
    if (kind === 'patch') {
      p.heal(30);
      audio.play('heal');
      this.popText(p.x, p.y - 40, t('pu_patch'), POWERUPS.patch.color);
      return;
    }
    this.powerups[kind] = BALANCE.powerupDurationMs * p.stats.powerupDurMult;
    audio.play('powerup');
    this.popText(p.x, p.y - 40, t(`pu_${kind}`), POWERUPS[kind].color);
  }

  // ---- wave / boss flow --------------------------------------------------------

  onWaveComplete() {
    this.clearEnemyBullets();
    this.pickups.getChildren().forEach((p) => {
      if (p.active) p.magnet = true;
    });
    audio.play('waveClear');

    let sub = '';
    if (!this.waveDamaged) {
      const bonus = BALANCE.noHitBonus(this.wave);
      this.addScore(bonus);
      sub = t('noHit', { n: bonus });
    }
    this.hud.banner(t('waveClear'), sub, 'success');

    const heal = this.player.stats.waveHeal;
    if (heal > 0 && this.player.alive) {
      this.player.heal(heal);
      this.popText(this.player.x, this.player.y - 40, `+${heal} HP`, COLOR.green);
    }
  }

  openUpgrade() {
    if (this.gameEnded) return;
    const choices = rollUpgrades(this.levels);
    if (choices.length === 0) {
      this.waves.upgradeDone();
      return;
    }
    this.dragId = null;
    this.scene.pause();
    this.scene.launch('Upgrade', { choices: choices.map((u) => u.id), levels: { ...this.levels } });
  }

  applyUpgrade(id) {
    const up = UPGRADES.find((u) => u.id === id);
    if (up) {
      this.levels[id] = (this.levels[id] ?? 0) + 1;
      up.apply(this.player.stats, this.player);
      this.player.syncDrones();
    }
    this.waves.upgradeDone();
  }

  onBossKilled(boss) {
    const bonus = Math.round(boss.cfg.score * this.scoreMult);
    this.addScore(bonus);
    this.clearEnemyBullets();
    this.hud.hideBoss();
    this.hud.banner(t('bossDefeated', { n: bonus }), '', 'success');

    for (let i = 0; i < 9; i++) {
      this.time.delayedCall(i * 130, () => {
        const x = boss.x + Phaser.Math.Between(-boss.width / 2, boss.width / 2);
        const y = boss.y + Phaser.Math.Between(-boss.height / 2, boss.height / 2);
        this.explode(x, y, i % 2 ? COLOR.orange : COLOR.yellow, 14);
        audio.play('explode');
      });
    }
    this.time.delayedCall(1250, () => {
      this.explode(boss.x, boss.y, COLOR.white, 40, true);
      this.explode(boss.x, boss.y, COLOR.red, 30, true);
      this.cameras.main.flash(250, 255, 255, 255);
      this.cameras.main.shake(400, 0.012);
      audio.play('bigExplode');
      this.spawnPickup('patch', boss.x - 30, boss.y);
      this.spawnPickup(rollPowerup(1), boss.x + 30, boss.y);
      boss.destroy();
      this.boss = null;
      this.time.delayedCall(700, () => this.waves.complete());
    });
  }

  clearEnemyBullets() {
    this.enemyBullets.getChildren().forEach((b) => {
      if (!b.active) return;
      this.spark(b.x, b.y, COLOR.cyan, 2);
      b.disableBody(true, true);
    });
  }

  playerDeath() {
    const p = this.player;
    this.gameEnded = true;
    p.alive = false;
    this.explode(p.x, p.y, COLOR.cyan, 40, true);
    this.explode(p.x, p.y, COLOR.white, 24, true);
    p.hideAll();
    this.cameras.main.shake(500, 0.015);
    audio.play('bigExplode');
    audio.stopMusic();
    this.time.delayedCall(1400, () => {
      audio.play('gameOver');
      this.scene.pause();
      this.scene.pause('Hud');
      this.scene.launch('GameOver', { score: this.score, wave: this.wave });
    });
  }

  openPause() {
    if (this.gameEnded || !this.scene.isActive()) return;
    this.dragId = null;
    this.scene.pause();
    this.scene.launch('Pause');
  }

  // ---- effects ------------------------------------------------------------------

  // One emitter per color/size, created on first use and reused.
  getEmitter(color, big = false) {
    const key = `${color}-${big ? 'big' : 'small'}`;
    if (!this.emitters[key]) {
      this.emitters[key] = this.add
        .particles(0, 0, 'px', {
          speed: big ? { min: 90, max: 380 } : { min: 40, max: 240 },
          lifespan: big ? { min: 400, max: 900 } : { min: 200, max: 550 },
          alpha: { start: 1, end: 0 },
          scale: { start: big ? 2 : 1.4, end: 0.4 },
          tint: color,
          emitting: false,
        })
        .setDepth(7);
    }
    return this.emitters[key];
  }

  explode(x, y, color, count = 16, big = false) {
    this.getEmitter(color, big).explode(count, x, y);
  }

  spark(x, y, color, count = 4) {
    this.getEmitter(color).explode(count, x, y);
  }

  popText(x, y, str, color) {
    const txt = this.add
      .text(x, y, str, {
        fontFamily: FONT.body,
        fontSize: '18px',
        fontStyle: 'bold',
        color: `#${color.toString(16).padStart(6, '0')}`,
        stroke: HEX.bg,
        strokeThickness: 5,
        padding: { top: 4 },
      })
      .setOrigin(0.5)
      .setDepth(8);
    this.tweens.add({
      targets: txt,
      y: y - 50,
      alpha: 0,
      duration: 1300,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy(),
    });
  }
}
