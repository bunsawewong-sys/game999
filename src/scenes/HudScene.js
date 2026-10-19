import Phaser from 'phaser';
import { BALANCE, COLOR, FONT, HEX } from '../config.js';
import { t } from '../i18n.js';
import { POWERUPS, TIMED_POWERUPS } from '../data/powerups.js';

const BANNER_COLORS = { info: HEX.cyan, danger: HEX.red, success: HEX.green };
const isAscii = (s) => /^[\x20-\x7E]*$/.test(s);

// Overlay drawn above the game. It reads score/HP/etc. from GameScene each
// frame; GameScene calls banner(), showBoss(), hideBoss() and flashDamage().
export class HudScene extends Phaser.Scene {
  constructor() {
    super('Hud');
    this.queue = [];
  }

  create() {
    const { width: W, height: H } = this.scale;
    this.gs = this.scene.get('Game');
    this.queue = [];
    this.bannerBusy = false;

    const bar = this.add.graphics();
    bar.fillStyle(COLOR.navy, 0.85).fillRect(0, 0, W, 58);
    bar.fillStyle(COLOR.cyanDark, 1).fillRect(0, 58, W, 3);

    this.add.text(16, 12, 'SCORE', { fontFamily: FONT.pixel, fontSize: '10px', color: HEX.gray });
    this.scoreText = this.add.text(16, 30, '0', { fontFamily: FONT.pixel, fontSize: '18px', color: HEX.white });
    this.waveText = this.add
      .text(W / 2, 30, 'WAVE 1', { fontFamily: FONT.pixel, fontSize: '16px', color: HEX.cyan })
      .setOrigin(0.5);

    this.createPauseButton(W - 34, 30);

    // HP bar
    this.add.text(16, 76, 'HP', { fontFamily: FONT.pixel, fontSize: '12px', color: HEX.gray });
    this.hpGfx = this.add.graphics();
    this.hpText = this.add.text(278, 76, '', { fontFamily: FONT.pixel, fontSize: '11px', color: HEX.white });

    // Active power-ups
    this.puIcons = TIMED_POWERUPS.map((id) => ({
      id,
      icon: this.add.image(0, 0, POWERUPS[id].tex).setVisible(false),
    }));
    this.puGfx = this.add.graphics();

    // Boss bar
    this.bossBox = this.add.container(W / 2, 150).setVisible(false);
    this.bossName = this.add
      .text(0, -16, '', { fontFamily: FONT.pixel, fontSize: '12px', color: HEX.red, stroke: HEX.bg, strokeThickness: 4 })
      .setOrigin(0.5);
    this.bossGfx = this.add.graphics();
    this.bossBox.add([this.bossGfx, this.bossName]);

    // Banner
    this.bannerTitle = this.add
      .text(W / 2, H * 0.4, '', { fontFamily: FONT.pixel, fontSize: '30px', color: HEX.cyan, stroke: HEX.bg, strokeThickness: 8, align: 'center', padding: { top: 6, bottom: 6 } })
      .setOrigin(0.5)
      .setAlpha(0);
    this.bannerSub = this.add
      .text(W / 2, H * 0.4 + 46, '', { fontFamily: FONT.body, fontSize: '22px', fontStyle: 'bold', color: HEX.white, stroke: HEX.bg, strokeThickness: 6, align: 'center', padding: { top: 6, bottom: 4 }, wordWrap: { width: W - 40, useAdvancedWrap: true } })
      .setOrigin(0.5, 0)
      .setAlpha(0);

    this.vignette = this.add.rectangle(0, 0, W, H, COLOR.red, 1).setOrigin(0).setAlpha(0);
  }

  createPauseButton(x, y) {
    const g = this.add.graphics();
    const draw = (pressed) => {
      g.clear();
      g.fillStyle(pressed ? COLOR.cyanDark : COLOR.navy2, 1).fillRect(x - 22, y - 20, 44, 40);
      g.lineStyle(3, COLOR.cyan, 1).strokeRect(x - 22, y - 20, 44, 40);
      g.fillStyle(COLOR.cyan, 1).fillRect(x - 9, y - 10, 6, 20).fillRect(x + 3, y - 10, 6, 20);
    };
    draw(false);
    const zone = this.add.zone(x, y, 64, 60).setInteractive({ useHandCursor: true });
    let pressed = false;
    zone.on('pointerdown', () => {
      pressed = true;
      draw(true);
    });
    zone.on('pointerout', () => {
      pressed = false;
      draw(false);
    });
    zone.on('pointerup', () => {
      draw(false);
      if (!pressed) return;
      pressed = false;
      this.gs.openPause();
    });
  }

  banner(title, sub = '', style = 'info') {
    this.queue.push({ title, sub, style });
  }

  showBanner({ title, sub, style }) {
    this.bannerBusy = true;
    this.bannerTitle
      .setText(title)
      .setFontFamily(isAscii(title) ? FONT.pixel : FONT.body)
      .setFontStyle(isAscii(title) ? 'normal' : 'bold')
      .setFontSize(isAscii(title) ? 30 : 36)
      .setColor(BANNER_COLORS[style] ?? HEX.cyan);
    this.bannerSub.setText(sub);
    const targets = [this.bannerTitle, this.bannerSub];
    targets.forEach((o) => o.setAlpha(0).setScale(0.8));
    this.tweens.add({ targets, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' });
    this.tweens.add({
      targets,
      alpha: 0,
      delay: style === 'danger' ? 2300 : 1300,
      duration: 300,
      onComplete: () => {
        this.bannerBusy = false;
      },
    });
  }

  showBoss(boss) {
    this.boss = boss;
    this.bossName.setText(t(boss.cfg.nameKey));
    this.bossBox.setVisible(true);
  }

  hideBoss() {
    this.boss = null;
    this.bossBox?.setVisible(false);
  }

  flashDamage() {
    if (!this.vignette) return;
    this.tweens.killTweensOf(this.vignette);
    this.vignette.setAlpha(0.28);
    this.tweens.add({ targets: this.vignette, alpha: 0, duration: 350 });
  }

  update() {
    const gs = this.gs;
    if (!gs?.player) return;

    if (!this.bannerBusy && this.queue.length) this.showBanner(this.queue.shift());

    this.scoreText.setText(String(gs.score));
    this.waveText.setText(`WAVE ${Math.max(1, gs.wave)}`);

    const p = gs.player;
    const ratio = Phaser.Math.Clamp(p.hp / p.stats.maxHp, 0, 1);
    const color = ratio > 0.5 ? COLOR.green : ratio > 0.25 ? COLOR.yellow : COLOR.red;
    this.hpGfx.clear();
    this.hpGfx.fillStyle(COLOR.bg, 1).fillRect(48, 74, 220, 18);
    this.hpGfx.fillStyle(COLOR.navy2, 1).fillRect(51, 77, 214, 12);
    this.hpGfx.fillStyle(color, 1).fillRect(51, 77, Math.round(214 * ratio), 12);
    this.hpText.setText(`${Math.ceil(p.hp)}/${p.stats.maxHp}`);

    // Power-up icons with remaining-time bars
    this.puGfx.clear();
    let slot = 0;
    const full = BALANCE.powerupDurationMs * p.stats.powerupDurMult;
    for (const { id, icon } of this.puIcons) {
      const left = gs.powerups[id];
      if (!(left > 0)) {
        icon.setVisible(false);
        continue;
      }
      const x = 32 + slot * 50;
      const y = 120;
      icon.setVisible(left > 1500 || Math.floor(left / 150) % 2 === 0).setPosition(x, y);
      this.puGfx.fillStyle(COLOR.bg, 1).fillRect(x - 18, y + 17, 36, 6);
      this.puGfx.fillStyle(POWERUPS[id].color, 1).fillRect(x - 17, y + 18, Math.round(34 * Math.min(1, left / full)), 4);
      slot++;
    }

    if (this.boss) {
      const W = this.scale.width;
      const bw = W - 80;
      const r = Phaser.Math.Clamp(this.boss.hp / this.boss.maxHp, 0, 1);
      this.bossGfx.clear();
      this.bossGfx.fillStyle(COLOR.bg, 1).fillRect(-bw / 2 - 3, -3, bw + 6, 18);
      this.bossGfx.fillStyle(COLOR.redDark, 1).fillRect(-bw / 2, 0, bw, 12);
      this.bossGfx.fillStyle(COLOR.red, 1).fillRect(-bw / 2, 0, Math.round(bw * r), 12);
      this.bossGfx.fillStyle(COLOR.white, 0.5).fillRect(-bw / 2, 0, Math.round(bw * r), 3);
    }
  }
}
