import Phaser from 'phaser';
import { COLOR, HEX } from '../config.js';
import { audio } from '../audio/AudioEngine.js';
import { t } from '../i18n.js';
import { addText, createButton } from '../ui/Button.js';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create() {
    const { width: W, height: H } = this.scale;
    this.add.rectangle(0, 0, W, H, COLOR.bg, 0.82).setOrigin(0).setInteractive();
    addText(this, W / 2, H * 0.27, t('paused'), { size: 38, bold: true, color: HEX.cyan }).setStroke(HEX.bg, 6);

    const y0 = H * 0.42;
    createButton(this, W / 2, y0, t('resume'), () => this.resumeGame(), { width: 340, height: 70 });
    createButton(this, W / 2, y0 + 90, t('settings'), () => this.openSettings(), {
      width: 340,
      height: 64,
      variant: 'ghost',
    });

    let confirming = false;
    const quitBtn = createButton(
      this,
      W / 2,
      y0 + 176,
      t('quit'),
      () => {
        if (!confirming) {
          confirming = true;
          quitBtn.setLabel(t('quitConfirm'));
          return;
        }
        this.quitToMenu();
      },
      { width: 400, height: 64, variant: 'danger', fontSize: 20 },
    );

    this.input.keyboard?.once('keydown-ESC', () => this.resumeGame());
  }

  resumeGame() {
    this.scene.resume('Game');
    this.scene.stop();
  }

  openSettings() {
    this.scene.launch('Settings', { from: 'Pause' });
    this.scene.pause();
  }

  quitToMenu() {
    audio.stopMusic();
    this.scene.stop('Hud');
    this.scene.stop('Game');
    this.scene.start('Menu');
  }
}
