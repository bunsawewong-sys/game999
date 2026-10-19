// Scrolling cyber grid with falling binary "bits".

import { COLOR } from '../config.js';

export class Background {
  constructor(scene, bitCount = 26) {
    const { width, height } = scene.scale;
    this.scene = scene;
    this.height = height;
    this.width = width;
    this.grid = scene.add.tileSprite(0, 0, width, height, 'gridTile').setOrigin(0).setDepth(-10);
    this.bits = [];
    for (let i = 0; i < bitCount; i++) {
      const bit = scene.add
        .image(Math.random() * width, Math.random() * height, Math.random() < 0.5 ? 'bit0' : 'bit1')
        .setDepth(-9)
        .setScale(Math.random() < 0.3 ? 1 : 0.67);
      this.resetBit(bit, false);
      this.bits.push(bit);
    }
  }

  resetBit(bit, top = true) {
    bit.speed = 30 + Math.random() * 120;
    bit.setAlpha(0.08 + (bit.speed / 150) * 0.22);
    bit.setTint(Math.random() < 0.2 ? COLOR.green : COLOR.cyan);
    if (top) {
      bit.y = -20;
      bit.x = Math.random() * this.width;
      bit.setTexture(Math.random() < 0.5 ? 'bit0' : 'bit1');
    }
  }

  update(delta, speedMult = 1) {
    const dt = delta / 1000;
    this.grid.tilePositionY -= 40 * dt * speedMult;
    for (const bit of this.bits) {
      bit.y += bit.speed * dt * speedMult;
      if (bit.y > this.height + 20) this.resetBit(bit);
    }
  }
}
