import Phaser from 'phaser';
import { FONT, HEX } from '../config.js';
import { audio } from '../audio/AudioEngine.js';
import { getLang, setLang, t } from '../i18n.js';
import { storage } from '../storage.js';
import { askName } from '../ui/nameDialog.js';
import { Background } from '../ui/Background.js';
import { addText, createButton } from '../ui/Button.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { width: W, height: H } = this.scale;
    this.busy = false;
    this.bg = new Background(this);
    audio.playMusic('menu');

    // Title
    const titleStyle = (color) => ({
      fontFamily: FONT.pixel,
      fontSize: '40px',
      color,
      stroke: HEX.bg,
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 5, color: HEX.cyanDark, fill: true },
    });
    this.add.text(W / 2, H * 0.12, 'FIREWALL', titleStyle(HEX.cyan)).setOrigin(0.5);
    this.add.text(W / 2, H * 0.12 + 56, 'DEFENDER', titleStyle(HEX.red)).setOrigin(0.5);
    addText(this, W / 2, H * 0.12 + 108, t('tagline'), { size: 19, color: HEX.gray });

    // Hero ship with decorative enemies
    const ship = this.add.image(W / 2, H * 0.39, 'player0').setScale(2);
    this.tweens.add({ targets: ship, y: ship.y - 12, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.time.addEvent({
      delay: 90,
      loop: true,
      callback: () => ship.setTexture(ship.texture.key === 'player0' ? 'player1' : 'player0'),
    });
    [
      ['spam', W * 0.18, H * 0.31],
      ['virus', W * 0.82, H * 0.29],
      ['worm', W * 0.84, H * 0.44],
      ['ping', W * 0.16, H * 0.46],
    ].forEach(([tex, x, y], i) => {
      const e = this.add.image(x, y, tex).setAlpha(0.75);
      this.tweens.add({ targets: e, y: y + 10, duration: 900 + i * 170, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });

    addText(this, W / 2, H * 0.5, t('howTo'), { size: 17, color: HEX.gray });

    const y0 = H * 0.585;
    createButton(this, W / 2, y0, t('start'), () => this.startGame(), { width: 340, height: 74, fontSize: 28 });
    createButton(this, W / 2, y0 + 92, t('leaderboard'), () => this.open('Leaderboard'), {
      width: 340,
      height: 62,
      variant: 'ghost',
    });
    createButton(this, W / 2, y0 + 170, t('settings'), () => this.openSettings(), {
      width: 340,
      height: 62,
      variant: 'ghost',
    });

    // Player name + best score, kept close to the buttons on tall screens
    const yInfo = Math.min(y0 + 262, H - 120);
    this.nameText = addText(this, W / 2, yInfo, '', { size: 18, color: HEX.white });
    createButton(this, W / 2, yInfo + 44, t('changeName'), () => this.changeName(), {
      width: 200,
      height: 44,
      fontSize: 17,
      variant: 'ghost',
    });
    addText(this, W / 2, yInfo + 92, t('bestLabel', { score: storage.getBest() }), {
      size: 18,
      bold: true,
      color: HEX.yellow,
    });
    this.refreshName();

    // Quick language toggle
    createButton(this, W - 58, 30, getLang() === 'th' ? 'EN' : 'TH', () => this.toggleLang(), {
      width: 84,
      height: 40,
      fontSize: 16,
      font: FONT.pixel,
      variant: 'ghost',
    });

    this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
  }

  refreshName() {
    const name = storage.getName();
    this.nameText.setText(name ? t('playerLabel', { name }) : '');
  }

  async changeName() {
    if (this.busy) return;
    this.busy = true;
    const name = await askName(storage.getName());
    this.busy = false;
    if (name) {
      storage.saveName(name);
      this.refreshName();
    }
  }

  async startGame() {
    if (this.busy) return;
    if (!storage.getName()) {
      this.busy = true;
      const name = await askName('');
      this.busy = false;
      if (!name) return;
      storage.saveName(name);
    }
    this.scene.start('Game');
  }

  open(key) {
    if (!this.busy) this.scene.start(key);
  }

  openSettings() {
    if (this.busy) return;
    this.scene.launch('Settings', { from: 'Menu' });
    this.scene.pause();
  }

  toggleLang() {
    const next = getLang() === 'th' ? 'en' : 'th';
    setLang(next);
    storage.saveSettings({ ...storage.getSettings(), lang: next });
    this.scene.restart();
  }

  update(time, delta) {
    this.bg.update(delta, 0.6);
  }
}
