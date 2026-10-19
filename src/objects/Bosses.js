import Phaser from 'phaser';
import { COLOR, FONT, HEX } from '../config.js';
import { audio } from '../audio/AudioEngine.js';
import { t } from '../i18n.js';

// Base boss: flies in from the top, then runs fight() every frame.
// GameScene owns scoring, explosions and wave flow.
class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, tex, cfg, loop) {
    super(scene, scene.scale.width / 2, -80, tex);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.cfg = cfg;
    this.loop = loop;
    this.maxHp = Math.round(cfg.hp * scene.bossHpMult);
    this.hp = this.maxHp;
    this.state = 'enter';
    this.ft = 0; // time spent in the fight state (ms)
    this.flash = 0;
    this.targetY = Math.round(scene.scale.height * 0.19);
    this.y = -this.height / 2;
    this.setDepth(3);
    this.body.setCircle(cfg.radius, this.width / 2 - cfg.radius, this.height / 2 - cfg.radius);
  }

  get phase2() {
    return this.hp < this.maxHp * 0.5;
  }

  isVulnerable() {
    return this.state === 'fight';
  }

  // Returns 'blocked' | 'hit' | 'killed'.
  takeDamage(amount) {
    if (!this.isVulnerable()) return 'blocked';
    this.hp -= amount;
    this.setTintFill(0xffffff);
    this.flash = 40;
    if (this.hp <= 0) {
      this.hp = 0;
      this.state = 'dying';
      this.body.enable = false;
      this.onDeath();
      this.scene.onBossKilled(this);
      return 'killed';
    }
    return 'hit';
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.flash > 0) {
      this.flash -= delta;
      if (this.flash <= 0) this.clearTint();
    }
    if (this.state === 'enter') {
      this.y += Math.max(40, (this.targetY - this.y) * 2) * (delta / 1000);
      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.state = 'fight';
        this.onFightStart();
      }
    } else if (this.state === 'fight') {
      this.ft += delta;
      this.fight(delta);
    }
  }

  onFightStart() {}
  onDeath() {}
  fight() {}

  radial(count, speed, tex, offset = 0, dmg = 10) {
    for (let i = 0; i < count; i++) {
      const a = offset + (Math.PI * 2 * i) / count;
      this.scene.fireEnemyBullet(this.x, this.y, a, speed, tex, dmg);
    }
    audio.play('enemyShoot');
  }
}

export class DDoSBoss extends Boss {
  constructor(scene, loop) {
    super(scene, 'bossDDoS', { nameKey: 'boss_ddos', hp: 900, radius: 38, score: 1500 }, loop);
    this.attackTimer = 800;
    this.attackIdx = 0;
  }

  fight(delta) {
    const gs = this.scene;
    const W = gs.scale.width;
    const s = this.ft / 1000;
    this.x = W / 2 + Math.sin(s * 0.7) * W * 0.28;
    this.y = this.targetY + Math.sin(s * 1.4) * 14;

    this.attackTimer -= delta;
    if (this.attackTimer > 0) return;
    this.attackTimer = (this.phase2 ? 1500 : 2200) * gs.fireMult;
    const attack = this.attackIdx++ % 3;
    if (attack === 0) {
      this.radial(this.phase2 ? 20 : 14, this.phase2 ? 190 : 165, 'ebulletBig', Math.random() * Math.PI);
    } else if (attack === 1) {
      const n = this.phase2 ? 7 : 5;
      for (let i = 0; i < n; i++) {
        const x = this.x + (i - (n - 1) / 2) * 30;
        const vx = Phaser.Math.Clamp((gs.player.x - x) * 0.35, -110, 110);
        gs.spawnEnemy('ping', x, this.y + 30, { vx });
      }
    } else {
      for (let v = 0; v < 3; v++) {
        gs.time.delayedCall(v * 170, () => {
          if (this.state !== 'fight') return;
          const a = Phaser.Math.Angle.Between(this.x, this.y, gs.player.x, gs.player.y);
          for (const d of [-0.2, 0, 0.2]) gs.fireEnemyBullet(this.x, this.y + 20, a + d, 260, 'ebullet', 10);
          audio.play('enemyShoot');
        });
      }
    }
  }
}

export class RansomBoss extends Boss {
  constructor(scene, loop) {
    super(scene, 'bossRansom', { nameKey: 'boss_ransom', hp: 800, radius: 44, score: 2500 }, loop);
    this.encrypted = true;
    this.cycleTimer = 0;
    this.spiralTimer = 0;
    this.spiralAngle = 0;
    this.aimTimer = 0;
    this.shieldImg = scene.add.image(this.x, this.y, 'ransomShield').setDepth(4).setAlpha(0.75);
    this.label = scene.add
      .text(this.x, this.y, t('encrypted'), {
        fontFamily: FONT.pixel,
        fontSize: '12px',
        color: HEX.cyan,
        stroke: HEX.bg,
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(8);
  }

  isVulnerable() {
    return this.state === 'fight' && !this.encrypted;
  }

  onFightStart() {
    this.cycleTimer = 3500;
  }

  setEncrypted(on) {
    this.encrypted = on;
    this.shieldImg.setVisible(on);
    this.label.setVisible(on);
    this.cycleTimer = on ? (this.phase2 ? 3200 : 3500) : this.phase2 ? 3400 : 4000;
    audio.play(on ? 'block' : 'powerup');
    if (!on) this.scene.spark(this.x, this.y, COLOR.cyan, 24);
  }

  fight(delta) {
    const gs = this.scene;
    const W = gs.scale.width;
    const s = this.ft / 1000;
    this.x = W / 2 + Math.sin(s * 0.5) * W * 0.25;
    this.y = this.targetY + Math.sin(s * 0.9) * 10;

    this.cycleTimer -= delta;
    if (this.cycleTimer <= 0) this.setEncrypted(!this.encrypted);

    if (this.encrypted) {
      this.spiralTimer -= delta;
      if (this.spiralTimer <= 0) {
        this.spiralTimer = 140 * gs.fireMult;
        const arms = this.phase2 ? 3 : 2;
        for (let i = 0; i < arms; i++) {
          const a = this.spiralAngle + (Math.PI * 2 * i) / arms;
          gs.fireEnemyBullet(this.x, this.y, a, 140, 'ebulletPurple', 10);
        }
        this.spiralAngle += 0.33;
      }
    } else {
      this.aimTimer -= delta;
      if (this.aimTimer <= 0) {
        this.aimTimer = 800 * gs.fireMult;
        gs.fireAtPlayer(this.x, this.y + 30, 230, 'ebulletBig', 12, [-0.25, 0, 0.25]);
      }
    }
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.shieldImg.setPosition(this.x, this.y + 4);
    this.shieldImg.rotation -= delta * 0.0012;
    this.shieldImg.setAlpha(0.6 + Math.sin(time / 120) * 0.15);
    this.label.setPosition(this.x, this.y + this.height / 2 + 14);
  }

  onDeath() {
    this.shieldImg.setVisible(false);
    this.label.setVisible(false);
  }

  destroy(fromScene) {
    this.shieldImg?.destroy();
    this.label?.destroy();
    super.destroy(fromScene);
  }
}

export class BotnetBoss extends Boss {
  constructor(scene, loop) {
    super(scene, 'bossBotnet', { nameKey: 'boss_botnet', hp: 1300, radius: 40, score: 4000 }, loop);
    this.nodeCount = Math.min(5, 3 + loop);
    this.nodeRespawn = new Array(this.nodeCount).fill(0);
    this.nodeAlive = new Array(this.nodeCount).fill(false);
    this.laserState = 'idle';
    this.laserTimer = 3500;
    this.burstTimer = 2000;
    this.laserGfx = scene.add.graphics().setDepth(2);
  }

  onFightStart() {
    for (let i = 0; i < this.nodeCount; i++) this.spawnNode(i);
  }

  spawnNode(slot) {
    const angle = (Math.PI * 2 * slot) / this.nodeCount;
    const node = this.scene.spawnEnemy('botNode', this.x, this.y, {
      boss: this,
      slot,
      angle,
      radius: 120,
      fireDelay: 1200 + slot * 500,
    });
    this.nodeAlive[slot] = Boolean(node);
  }

  onNodeKilled(slot) {
    this.nodeAlive[slot] = false;
    this.nodeRespawn[slot] = 9000;
  }

  fight(delta) {
    const gs = this.scene;
    const W = gs.scale.width;
    const s = this.ft / 1000;
    this.x = W / 2 + Math.sin(s * 0.45) * W * 0.2;
    this.y = this.targetY + Math.sin(s * 1.1) * 8;

    for (let i = 0; i < this.nodeCount; i++) {
      if (this.nodeAlive[i]) continue;
      this.nodeRespawn[i] -= delta;
      if (this.nodeRespawn[i] <= 0) this.spawnNode(i);
    }

    this.burstTimer -= delta;
    if (this.burstTimer <= 0) {
      this.burstTimer = (this.phase2 ? 2400 : 3200) * gs.fireMult;
      this.radial(this.phase2 ? 14 : 10, 160, 'ebulletGreen', Math.random() * Math.PI);
    }

    this.updateLaser(delta);
  }

  updateLaser(delta) {
    const gs = this.scene;
    const H = gs.scale.height;
    const g = this.laserGfx;
    g.clear();

    if (this.laserState === 'idle') {
      this.laserTimer -= delta;
      if (this.laserTimer <= 0) {
        this.laserState = 'warn';
        this.laserX = gs.player.x;
        this.warnTimer = this.phase2 ? 750 : 1000;
        audio.play('charge');
      }
    } else if (this.laserState === 'warn') {
      this.warnTimer -= delta;
      const on = Math.floor(this.warnTimer / 90) % 2 === 0;
      g.fillStyle(COLOR.red, on ? 0.9 : 0.35).fillRect(this.laserX - 2, 0, 4, H);
      g.fillStyle(COLOR.red, 0.12).fillRect(this.laserX - this.beamWidth() / 2, 0, this.beamWidth(), H);
      if (this.warnTimer <= 0) {
        this.laserState = 'fire';
        this.beamTimer = 900;
        audio.play('beam');
        gs.cameras.main.shake(900, 0.004);
      }
    } else if (this.laserState === 'fire') {
      this.beamTimer -= delta;
      const w = this.beamWidth() * (0.85 + Math.random() * 0.15);
      g.fillStyle(COLOR.red, 0.85).fillRect(this.laserX - w / 2, 0, w, H);
      g.fillStyle(COLOR.white, 0.9).fillRect(this.laserX - w / 6, 0, w / 3, H);
      const p = gs.player;
      if (p.alive && Math.abs(p.x - this.laserX) < this.beamWidth() / 2 + 6) gs.hurtPlayer(30);
      if (this.beamTimer <= 0) {
        this.laserState = 'idle';
        this.laserTimer = (this.phase2 ? 4200 : 5500) * gs.fireMult;
      }
    }
  }

  beamWidth() {
    return this.phase2 ? 60 : 46;
  }

  onDeath() {
    this.laserGfx.clear();
    this.laserState = 'idle';
  }

  destroy(fromScene) {
    this.laserGfx?.destroy();
    super.destroy(fromScene);
  }
}

export const BOSS_CLASSES = [DDoSBoss, RansomBoss, BotnetBoss];
