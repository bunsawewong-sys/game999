import Phaser from 'phaser';
import { COLOR } from '../config.js';

function offscreen(obj, margin = 40) {
  const { width, height } = obj.scene.scale;
  return obj.y < -margin || obj.y > height + margin || obj.x < -margin || obj.x > width + margin;
}

export class PlayerBullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bullet');
    this.hitSet = new Set();
  }

  fire(x, y, angle, speed, damage, pierce, crit, laser) {
    this.setTexture(laser ? 'laser' : 'bullet');
    this.enableBody(true, x, y, true, true);
    this.body.setSize(this.width, this.height, true);
    this.setRotation(angle + Math.PI / 2);
    this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.damage = damage;
    this.pierce = pierce;
    this.crit = crit;
    this.hitSet.clear();
    if (crit) this.setTint(COLOR.yellow);
    else this.clearTint();
    this.setDepth(4);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (offscreen(this)) this.disableBody(true, true);
  }
}

export class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'ebullet');
  }

  fire(x, y, angle, speed, tex, damage) {
    this.setTexture(tex);
    this.enableBody(true, x, y, true, true);
    const r = Math.max(3, this.width / 2 - 3);
    this.body.setCircle(r, this.width / 2 - r, this.height / 2 - r);
    this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.damage = damage;
    this.setDepth(4);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (offscreen(this, 30)) this.disableBody(true, true);
  }
}
