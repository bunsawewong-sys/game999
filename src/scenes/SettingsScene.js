import Phaser from 'phaser';
import { COLOR, FONT, HEX } from '../config.js';
import { audio } from '../audio/AudioEngine.js';
import { getLang, setLang, t } from '../i18n.js';
import { storage } from '../storage.js';
import { addText, createButton } from '../ui/Button.js';

const STEPS = 10;

// Opened from the menu or the pause screen. Changing language restarts this
// scene, and Back restarts the caller so its text updates too.
export class SettingsScene extends Phaser.Scene {
  constructor() {
    super('Settings');
  }

  init(data) {
    this.from = data?.from ?? 'Menu';
  }

  create() {
    const { width: W, height: H } = this.scale;
    this.settings = storage.getSettings();
    this.add.rectangle(0, 0, W, H, COLOR.navy, 1).setOrigin(0).setInteractive();
    addText(this, W / 2, H * 0.16, t('settings'), { size: 36, bold: true, color: HEX.cyan });

    this.volumeRow(H * 0.3, 'sfx');
    this.volumeRow(H * 0.45, 'bgm');

    addText(this, W / 2, H * 0.6, t('language'), { size: 22, bold: true });
    const lang = getLang();
    const langBtn = (x, code, label) =>
      createButton(this, x, H * 0.6 + 56, label, () => this.changeLang(code), {
        width: 190,
        height: 58,
        variant: lang === code ? 'primary' : 'ghost',
      });
    langBtn(W / 2 - 104, 'th', 'ไทย');
    langBtn(W / 2 + 104, 'en', 'English');

    createButton(this, W / 2, H * 0.84, t('back'), () => this.back(), { width: 300, height: 64, variant: 'ghost' });
    this.input.keyboard?.once('keydown-ESC', () => this.back());
  }

  volumeRow(y, key) {
    const W = this.scale.width;
    addText(this, W / 2, y - 44, t(key), { size: 22, bold: true });
    const g = this.add.graphics();
    const segW = 26;
    const gap = 4;
    const barW = STEPS * (segW + gap) - gap;
    const x0 = W / 2 - barW / 2;
    const pct = this.add
      .text(W / 2, y + 40, '', { fontFamily: FONT.pixel, fontSize: '12px', color: HEX.gray })
      .setOrigin(0.5);

    const draw = () => {
      const level = Math.round(this.settings[key] * STEPS);
      g.clear();
      for (let i = 0; i < STEPS; i++) {
        g.fillStyle(i < level ? COLOR.cyan : COLOR.navy2, 1).fillRect(x0 + i * (segW + gap), y - 14, segW, 28);
      }
      pct.setText(level === 0 ? 'OFF' : `${level * 10}%`);
    };
    draw();

    const set = (level) => {
      this.settings[key] = Phaser.Math.Clamp(level, 0, STEPS) / STEPS;
      storage.saveSettings(this.settings);
      audio.setVolumes(this.settings.sfx, this.settings.bgm);
      draw();
      if (key === 'sfx') audio.play('pickup');
    };

    const zone = this.add.zone(W / 2, y, barW, 50).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', (p) => set(Math.ceil((p.x - x0) / (segW + gap))));
    const btnOpts = { width: 52, height: 48, fontSize: 26, variant: 'ghost', sound: null };
    createButton(this, x0 - 42, y, '-', () => set(Math.round(this.settings[key] * STEPS) - 1), btnOpts);
    createButton(this, x0 + barW + 42, y, '+', () => set(Math.round(this.settings[key] * STEPS) + 1), btnOpts);
  }

  changeLang(code) {
    if (code === getLang()) return;
    setLang(code);
    this.settings.lang = code;
    storage.saveSettings(this.settings);
    this.scene.restart({ from: this.from });
  }

  back() {
    if (this.from === 'Pause') this.scene.start('Pause');
    else this.scene.start('Menu');
  }
}
