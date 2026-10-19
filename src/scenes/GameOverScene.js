import Phaser from 'phaser';
import { COLOR, FONT, HEX } from '../config.js';
import { t } from '../i18n.js';
import { storage } from '../storage.js';
import { submitScore } from '../services/leaderboard.js';
import { addText, createButton } from '../ui/Button.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.finalScore = data.score ?? 0;
    this.finalWave = data.wave ?? 1;
  }

  create() {
    const { width: W, height: H } = this.scale;
    this.add.rectangle(0, 0, W, H, COLOR.bg, 0.86).setOrigin(0).setInteractive();

    const title = this.add
      .text(W / 2, H * 0.15, t('gameOver'), { fontFamily: FONT.pixel, fontSize: '32px', color: HEX.red, stroke: HEX.bg, strokeThickness: 8 })
      .setOrigin(0.5);
    this.tweens.add({ targets: title, alpha: 0.6, duration: 500, yoyo: true, repeat: -1 });
    addText(this, W / 2, H * 0.15 + 46, t('gameOverSub'), { size: 20, color: HEX.gray });

    addText(this, W / 2, H * 0.3, t('score'), { size: 22, bold: true, color: HEX.gray });
    this.add
      .text(W / 2, H * 0.3 + 46, String(this.finalScore), { fontFamily: FONT.pixel, fontSize: '34px', color: HEX.yellow })
      .setOrigin(0.5);
    addText(this, W / 2, H * 0.3 + 96, t('reached', { n: this.finalWave }), { size: 22, color: HEX.white });

    const best = storage.getBest();
    if (this.finalScore > best) {
      storage.saveBest(this.finalScore);
      const nb = addText(this, W / 2, H * 0.3 + 134, t('newBest'), { size: 24, bold: true, color: HEX.green });
      this.tweens.add({ targets: nb, scale: 1.12, duration: 400, yoyo: true, repeat: -1 });
    }

    this.status = addText(this, W / 2, H * 0.55, t('submitting'), { size: 20, color: HEX.cyan, wrap: W - 60 });
    this.submit();

    const y0 = H * 0.66;
    createButton(this, W / 2, y0, t('retry'), () => this.go('Game'), { width: 340, height: 70 });
    createButton(this, W / 2, y0 + 88, t('leaderboard'), () => this.go('Leaderboard'), {
      width: 340,
      height: 62,
      variant: 'ghost',
    });
    createButton(this, W / 2, y0 + 168, t('menu'), () => this.go('Menu'), { width: 340, height: 62, variant: 'ghost' });
  }

  async submit() {
    const name = storage.getName();
    if (!name || this.finalScore <= 0) {
      this.status.setText('');
      return;
    }
    const res = await submitScore(name, this.finalScore, this.finalWave);
    if (!this.status.active) return; // scene was left while waiting
    const rank = t('rank', { n: res.rank });
    this.status.setText(res.mode === 'online' ? rank : `${rank}\n${t('savedLocal')}`);
  }

  go(key) {
    this.scene.stop('Hud');
    if (key !== 'Game') this.scene.stop('Game');
    this.scene.start(key);
  }
}
