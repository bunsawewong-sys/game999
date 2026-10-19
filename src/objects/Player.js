import Phaser from 'phaser';
import { BALANCE } from '../config.js';

const DRONE_OFFSETS = [
  { x: -40, y: 12 },
  { x: 40, y: 12 },
];

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player0');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const r = BALANCE.player.hitRadius;
    this.body.setCircle(r, this.width / 2 - r, this.height / 2 - r - 2);
    this.setDepth(5);

    this.stats = {
      maxHp: BALANCE.player.maxHp,
      damageMult: 1,
      fireRateMult: 1,
      bulletSpeedMult: 1,
      sideGuns: 0,
      pierce: 0,
      magnetMult: 1,
      critChance: 0.03,
      waveHeal: 0,
      powerupDurMult: 1,
    };
    this.hp = this.stats.maxHp;
    this.invuln = 0;
    this.flameTimer = 0;
    this.alive = true;

    this.shield = scene.add.image(x, y, 'playerShield').setDepth(6).setVisible(false).setAlpha(0.85);
    this.drones = [];
  }

  heal(amount) {
    this.hp = Math.min(this.stats.maxHp, this.hp + amount);
  }

  setShield(on) {
    this.shield.setVisible(on && this.alive);
  }

  syncDrones() {
    while (this.drones.length < this.stats.sideGuns) {
      const off = DRONE_OFFSETS[this.drones.length];
      this.drones.push(this.scene.add.image(this.x + off.x, this.y + off.y, 'drone').setDepth(5));
    }
  }

  hideAll() {
    this.setVisible(false);
    this.shield.setVisible(false);
    this.drones.forEach((d) => d.setVisible(false));
    this.body.enable = false;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.alive) return;

    this.flameTimer += delta;
    if (this.flameTimer > 90) {
      this.flameTimer = 0;
      this.setTexture(this.texture.key === 'player0' ? 'player1' : 'player0');
    }

    if (this.invuln > 0) {
      this.invuln -= delta;
      this.setAlpha(Math.floor(this.invuln / 80) % 2 ? 0.3 : 1);
    } else if (this.alpha !== 1) {
      this.setAlpha(1);
    }

    this.shield.setPosition(this.x, this.y);
    this.shield.rotation += delta * 0.003;

    const k = Math.min(1, delta / 60);
    this.drones.forEach((d, i) => {
      const off = DRONE_OFFSETS[i];
      d.x += (this.x + off.x - d.x) * k;
      d.y += (this.y + off.y - d.y) * k;
    });
  }
}
