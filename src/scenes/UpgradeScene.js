import Phaser from 'phaser';
import { COLOR, FONT, HEX } from '../config.js';
import { audio } from '../audio/AudioEngine.js';
import { t } from '../i18n.js';
import { UPGRADES } from '../data/upgrades.js';
import { addText } from '../ui/Button.js';

const CARD_W = 480;
const CARD_H = 136;
const INPUT_DELAY_MS = 450;

export class UpgradeScene extends Phaser.Scene {
  constructor() {
    super('Upgrade');
  }

  init(data) {
    this.choices = data.choices ?? [];
    this.levels = data.levels ?? {};
    this.picked = false;
  }

  create() {
    const { width: W, height: H } = this.scale;
    this.add.rectangle(0, 0, W, H, COLOR.bg, 0.78).setOrigin(0).setInteractive();

    const title = addText(this, W / 2, H * 0.2, t('chooseUpgrade'), { size: 32, color: HEX.cyan, bold: true });
    title.setStroke(HEX.bg, 6);

    const total = this.choices.length * (CARD_H + 22) - 22;
    const top = Math.max(H * 0.27, (H - total) / 2);
    this.choices.forEach((id, i) => {
      const y = top + CARD_H / 2 + i * (CARD_H + 22);
      const card = this.createCard(W / 2, y, id);
      card.setAlpha(0).setY(y + 30);
      this.tweens.add({ targets: card, alpha: 1, y, delay: 80 + i * 90, duration: 260, ease: 'Cubic.easeOut' });
    });

    this.inputReadyAt = this.time.now + INPUT_DELAY_MS;
  }

  createCard(x, y, id) {
    const up = UPGRADES.find((u) => u.id === id);
    const lv = this.levels[id] ?? 0;
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const draw = (hover) => {
      g.clear();
      g.fillStyle(COLOR.bg, 1).fillRect(-CARD_W / 2 - 4, -CARD_H / 2 - 4, CARD_W + 8, CARD_H + 8);
      g.fillStyle(hover ? COLOR.cyanDark : COLOR.navy2, 1).fillRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H);
      g.lineStyle(3, hover ? COLOR.white : COLOR.cyan, 1).strokeRect(-CARD_W / 2 + 1.5, -CARD_H / 2 + 1.5, CARD_W - 3, CARD_H - 3);
      g.fillStyle(COLOR.bg, 1).fillRect(-CARD_W / 2 + 18, -36, 72, 72);
      g.lineStyle(2, COLOR.cyanDark, 1).strokeRect(-CARD_W / 2 + 18, -36, 72, 72);
    };
    draw(false);

    const icon = this.add.image(-CARD_W / 2 + 54, 0, `up_${id}`).setScale(2);
    const name = addText(this, -CARD_W / 2 + 110, -26, t(`up_${id}`), {
      size: 23,
      bold: true,
      color: HEX.white,
      originX: 0,
    });
    const desc = addText(this, -CARD_W / 2 + 110, 10, t(`up_${id}_desc`), {
      size: 19,
      color: HEX.gray,
      originX: 0,
      wrap: CARD_W - 130,
    });
    const level = this.add
      .text(CARD_W / 2 - 14, -CARD_H / 2 + 14, `Lv ${lv} > ${lv + 1}/${up.max}`, {
        fontFamily: FONT.pixel,
        fontSize: '10px',
        color: HEX.yellow,
      })
      .setOrigin(1, 0);
    c.add([g, icon, name, desc, level]);
    c.setSize(CARD_W, CARD_H).setInteractive({ useHandCursor: true });

    let pressed = false;
    c.on('pointerdown', () => {
      if (this.time.now < this.inputReadyAt || this.picked) return;
      pressed = true;
      draw(true);
    });
    c.on('pointerout', () => {
      pressed = false;
      draw(false);
    });
    c.on('pointerup', () => {
      if (!pressed || this.picked) return;
      pressed = false;
      this.pick(id, c);
    });
    return c;
  }

  pick(id, card) {
    this.picked = true;
    audio.play('upgrade');
    this.tweens.add({ targets: card, scale: 1.05, duration: 90, yoyo: true });
    this.time.delayedCall(220, () => {
      const game = this.scene.get('Game');
      game.applyUpgrade(id);
      this.scene.resume('Game');
      this.scene.stop();
    });
  }
}
