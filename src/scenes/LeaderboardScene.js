import Phaser from 'phaser';
import { COLOR, FONT, HEX } from '../config.js';
import { audio } from '../audio/AudioEngine.js';
import { t } from '../i18n.js';
import { storage } from '../storage.js';
import { fetchTop } from '../services/leaderboard.js';
import { nameKey } from '../../shared/validate.js';
import { Background } from '../ui/Background.js';
import { addText, createButton } from '../ui/Button.js';

const ROW_H = 46;
const RANK_COLORS = [HEX.yellow, HEX.white, HEX.orange];

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('Leaderboard');
  }

  create() {
    const { width: W, height: H } = this.scale;
    audio.playMusic('menu');
    this.bg = new Background(this, 16);
    this.add.rectangle(0, 0, W, H, COLOR.bg, 0.6).setOrigin(0);

    this.add.text(W / 2, 58, t('lbTitle'), { fontFamily: FONT.pixel, fontSize: '28px', color: HEX.cyan }).setOrigin(0.5);
    this.modeText = addText(this, W / 2, 100, '', { size: 16, color: HEX.gray, wrap: W - 40 });

    this.listTop = 130;
    this.listBottom = H - 110;
    const g = this.add.graphics();
    g.lineStyle(2, COLOR.cyanDark, 1).strokeRect(14, this.listTop - 6, W - 28, this.listBottom - this.listTop + 12);

    this.list = this.add.container(0, this.listTop);
    const maskShape = this.make.graphics({}, false);
    maskShape.fillStyle(0xffffff).fillRect(0, this.listTop, W, this.listBottom - this.listTop);
    this.list.setMask(maskShape.createGeometryMask());

    this.loading = addText(this, W / 2, H / 2, t('lbLoading'), { size: 20, color: HEX.gray });
    this.setupScroll();

    createButton(this, W / 2, H - 54, t('back'), () => this.scene.start('Menu'), {
      width: 300,
      height: 62,
      variant: 'ghost',
    });
    this.input.keyboard?.once('keydown-ESC', () => this.scene.start('Menu'));

    this.loadScores();
  }

  async loadScores() {
    const { mode, top } = await fetchTop();
    if (!this.loading.active) return;
    this.loading.setVisible(false);
    this.modeText.setText(mode === 'online' ? t('lbOnline') : t('lbLocal'));
    if (top.length === 0) {
      addText(this, this.scale.width / 2, this.scale.height / 2, t('lbEmpty'), { size: 20, color: HEX.gray });
      return;
    }
    this.renderRows(top);
  }

  renderRows(rows) {
    const W = this.scale.width;
    const me = nameKey(storage.getName());
    rows.forEach((row, i) => {
      const y = i * ROW_H + ROW_H / 2;
      const mine = me && nameKey(row.name) === me;
      if (mine || i % 2 === 0) {
        const bg = this.add.rectangle(W / 2, y, W - 36, ROW_H - 4, mine ? COLOR.cyanDark : COLOR.navy2, mine ? 0.8 : 0.6);
        this.list.add(bg);
      }
      const color = RANK_COLORS[i] ?? HEX.gray;
      this.list.add([
        this.add.text(30, y, String(i + 1).padStart(2, ' '), { fontFamily: FONT.pixel, fontSize: '14px', color }).setOrigin(0, 0.5),
        addText(this, 84, y, row.name, { size: 20, bold: true, color: HEX.white, originX: 0 }),
        this.add.text(W - 190, y, `W${row.wave}`, { fontFamily: FONT.pixel, fontSize: '10px', color: HEX.gray }).setOrigin(0, 0.5),
        this.add.text(W - 30, y, String(row.score), { fontFamily: FONT.pixel, fontSize: '14px', color: HEX.yellow }).setOrigin(1, 0.5),
      ]);
    });
    this.contentH = rows.length * ROW_H;
  }

  setupScroll() {
    this.contentH = 0;
    let lastY = null;
    const clamp = (y) => {
      const view = this.listBottom - this.listTop;
      const minY = this.listTop - Math.max(0, this.contentH - view);
      return Phaser.Math.Clamp(y, minY, this.listTop);
    };
    this.input.on('pointerdown', (p) => {
      if (p.y >= this.listTop && p.y <= this.listBottom) lastY = p.y;
    });
    this.input.on('pointermove', (p) => {
      if (lastY === null || !p.isDown) return;
      this.list.y = clamp(this.list.y + (p.y - lastY));
      lastY = p.y;
    });
    this.input.on('pointerup', () => {
      lastY = null;
    });
    this.input.on('wheel', (p, objs, dx, dy) => {
      this.list.y = clamp(this.list.y - dy * 0.5);
    });
  }

  update(time, delta) {
    this.bg.update(delta, 0.5);
  }
}
