import Phaser from 'phaser';
import { COLOR } from '../config.js';

// hp/speed are base values; GameScene multiplies them by the wave scaling.
// drop multiplies the base power-up drop chance.
export const ENEMY_TYPES = {
  spam: { tex: 'spam', hp: 20, speed: 95, score: 10, radius: 14, contact: 20, drop: 1, color: COLOR.orange },
  ping: { tex: 'ping', hp: 8, speed: 240, score: 15, radius: 9, contact: 12, drop: 0.5, color: COLOR.red },
  worm: { tex: 'worm', hp: 28, speed: 120, score: 25, radius: 12, contact: 18, drop: 0.9, color: COLOR.purple },
  trojan: { tex: 'trojanSafe', hp: 70, speed: 120, score: 50, radius: 15, contact: 20, drop: 2.5, color: COLOR.red },
  virus: { tex: 'virus', hp: 45, speed: 80, score: 30, radius: 15, contact: 20, drop: 1.3, color: COLOR.yellow },
  virusSmall: { tex: 'virusSmall', hp: 10, speed: 150, score: 10, radius: 9, contact: 10, drop: 0.3, color: COLOR.yellow },
  botNode: { tex: 'botNode', hp: 160, speed: 0, score: 40, radius: 14, contact: 15, drop: 1.2, color: COLOR.gray },
};

let nextUid = 1;

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'spam');
  }

  spawn(kind, x, y, opts = {}) {
    const gs = this.scene;
    const def = ENEMY_TYPES[kind];
    this.uid = nextUid++;
    this.kind = kind;
    this.def = def;
    this.opts = opts;
    this.setTexture(def.tex);
    this.enableBody(true, x, y, true, true);
    this.body.setCircle(def.radius, this.width / 2 - def.radius, this.height / 2 - def.radius);
    this.body.setVelocity(0, 0);
    this.maxHp = Math.round((opts.hp ?? def.hp) * gs.hpMult);
    this.hp = this.maxHp;
    this.speed = def.speed * gs.speedMult;
    this.age = 0;
    this.phase = 'move';
    this.fireTimer = opts.fireDelay ?? 1000;
    this.flash = 0;
    this.clearTint();
    this.setAlpha(1).setRotation(0).setDepth(3);

    switch (kind) {
      case 'spam':
      case 'ping':
        this.body.setVelocity(opts.vx ?? 0, this.speed);
        break;
      case 'virusSmall':
        this.body.setVelocity(opts.vx ?? 0, opts.vy ?? this.speed);
        break;
      case 'worm':
      case 'virus':
        this.body.setVelocity(0, this.speed);
        break;
      case 'trojan':
        this.phase = 'enter';
        this.body.setVelocity(0, this.speed);
        break;
      default:
        break;
    }
    return this;
  }

  // Returns true when this hit kills the enemy.
  damage(amount) {
    this.hp -= amount;
    this.setTintFill(0xffffff);
    this.flash = 50;
    return this.hp <= 0;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    this.age += delta;
    if (this.flash > 0) {
      this.flash -= delta;
      if (this.flash <= 0) this.clearTint();
    }
    this.behave(delta);

    const { width, height } = this.scene.scale;
    if (this.y > height + 50 || this.x < -90 || this.x > width + 90) this.disableBody(true, true);
  }

  behave(delta) {
    const gs = this.scene;
    const sec = this.age / 1000;
    const { width } = gs.scale;

    switch (this.kind) {
      case 'worm': {
        const o = this.opts;
        this.x = o.baseX + Math.sin(sec * o.freq + o.phase) * o.amp;
        break;
      }
      case 'virus':
        this.body.velocity.x = Math.sin(sec * 3 + this.uid) * 55;
        break;
      case 'trojan':
        this.behaveTrojan(delta, width);
        break;
      case 'botNode': {
        const boss = this.opts.boss;
        if (!boss || !boss.active || boss.state === 'dying') {
          this.disableBody(true, true);
          return;
        }
        const a = this.opts.angle + sec * 0.9;
        this.setPosition(boss.x + Math.cos(a) * this.opts.radius, boss.y + 10 + Math.sin(a) * this.opts.radius * 0.55);
        this.fireTimer -= delta;
        if (this.fireTimer <= 0 && boss.state === 'fight') {
          this.fireTimer = 2400 * gs.fireMult;
          gs.fireAtPlayer(this.x, this.y, 210, 'ebulletGreen', 10);
        }
        break;
      }
      default:
        break;
    }
  }

  behaveTrojan(delta, width) {
    const gs = this.scene;
    if (this.phase === 'enter') {
      if (this.y >= this.opts.stopY) {
        this.phase = 'strafe';
        this.setTexture('trojan');
        this.setTintFill(0xffffff);
        this.flash = 120;
        this.body.setVelocity(Math.random() < 0.5 ? -75 : 75, 10);
        this.fireTimer = 600;
        gs.spark(this.x, this.y, COLOR.red, 10);
      }
    } else if (this.phase === 'strafe') {
      const vx = this.body.velocity.x;
      if ((this.x < 40 && vx < 0) || (this.x > width - 40 && vx > 0)) this.body.velocity.x = -vx;
      this.fireTimer -= delta;
      if (this.fireTimer <= 0) {
        this.fireTimer = 1700 * gs.fireMult;
        gs.fireAtPlayer(this.x, this.y + 12, 230, 'ebullet', 10);
      }
      if (this.age > 14000) {
        this.phase = 'leave';
        this.body.setVelocity(0, 220);
      }
    }
  }
}
