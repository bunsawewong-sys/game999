import Phaser from 'phaser';
import { BALANCE } from '../config.js';
import { POWERUPS } from '../data/powerups.js';

export class Pickup extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'pu_patch');
  }

  spawn(kind, x, y) {
    this.kind = kind;
    this.setTexture(POWERUPS[kind].tex);
    this.enableBody(true, x, y, true, true);
    this.body.setSize(this.width + 12, this.height + 12, true);
    this.body.setVelocity(Phaser.Math.Between(-40, 40), 80);
    this.magnet = false;
    this.age = 0;
    this.setDepth(4);
    return this;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.age += delta;
    const player = this.scene.player;
    if (player?.alive) {
      const range = BALANCE.player.magnetRange * player.stats.magnetMult;
      const d = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (this.magnet || d < range) {
        const a = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.body.setVelocity(Math.cos(a) * 560, Math.sin(a) * 560);
      } else {
        this.body.velocity.x *= 0.98;
        this.body.velocity.y = 85;
      }
    }
    // Blink so items stand out from enemies.
    this.setAlpha(Math.floor(this.age / 220) % 4 === 0 ? 0.55 : 1);
    if (this.y > this.scene.scale.height + 30) this.disableBody(true, true);
  }
}
