import Phaser from 'phaser';
import { generateTextures } from '../art/sprites.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    generateTextures(this);
    this.scene.start('Menu');
  }
}
