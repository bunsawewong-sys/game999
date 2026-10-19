// Pixel-style button. Fires on release only if the press started on the
// button, so a finger that is still dragging from gameplay can't trigger it.

import { COLOR, FONT, HEX } from '../config.js';
import { audio } from '../audio/AudioEngine.js';

const VARIANTS = {
  primary: { fill: COLOR.cyan, shade: COLOR.cyanDark, border: COLOR.white, text: HEX.bg },
  ghost: { fill: COLOR.navy2, shade: COLOR.bg, border: COLOR.cyanDark, text: HEX.cyan },
  danger: { fill: COLOR.red, shade: COLOR.redDark, border: COLOR.white, text: HEX.white },
};

export function createButton(scene, x, y, label, onClick, opts = {}) {
  const {
    width = 320,
    height = 64,
    fontSize = 24,
    font = FONT.body,
    variant = 'primary',
    sound = 'click',
  } = opts;
  const v = VARIANTS[variant] ?? VARIANTS.primary;

  const container = scene.add.container(x, y);
  const gfx = scene.add.graphics();
  const text = scene.add
    .text(0, 0, label, {
      fontFamily: font,
      fontSize: `${fontSize}px`,
      fontStyle: 'bold',
      color: v.text,
      align: 'center',
      padding: { top: 4, bottom: 4 },
    })
    .setOrigin(0.5);

  const draw = (pressed) => {
    const w = width;
    const h = height;
    const off = pressed ? 3 : 0;
    gfx.clear();
    gfx.fillStyle(COLOR.bg, 1).fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
    gfx.fillStyle(v.shade, 1).fillRect(-w / 2, -h / 2 + 3, w, h - 3);
    gfx.fillStyle(v.fill, 1).fillRect(-w / 2, -h / 2 + off, w, h - 6);
    gfx.fillStyle(v.border, variant === 'ghost' ? 1 : 0.35).fillRect(-w / 2, -h / 2 + off, w, 3);
    if (variant === 'ghost') {
      gfx.lineStyle(3, v.border, 1).strokeRect(-w / 2 + 1.5, -h / 2 + 1.5 + off, w - 3, h - 6);
    }
    text.setY(off - 2);
  };
  draw(false);

  container.add([gfx, text]);
  container.setSize(width, height);
  container.setInteractive({ useHandCursor: true });

  let pressed = false;
  let enabled = true;
  container.on('pointerdown', () => {
    if (!enabled) return;
    pressed = true;
    draw(true);
  });
  container.on('pointerout', () => {
    pressed = false;
    draw(false);
  });
  container.on('pointerup', () => {
    if (!pressed || !enabled) return;
    pressed = false;
    draw(false);
    if (sound) audio.play(sound);
    onClick();
  });

  container.setLabel = (s) => {
    text.setText(s);
    return container;
  };
  container.setEnabled = (on) => {
    enabled = on;
    container.setAlpha(on ? 1 : 0.45);
    return container;
  };
  return container;
}

export function addText(scene, x, y, str, opts = {}) {
  const { size = 20, color = HEX.white, font = FONT.body, bold = false, align = 'center', wrap } = opts;
  const style = {
    fontFamily: font,
    fontSize: `${size}px`,
    color,
    align,
    fontStyle: bold ? 'bold' : 'normal',
    padding: { top: 6, bottom: 4 },
  };
  if (wrap) style.wordWrap = { width: wrap, useAdvancedWrap: true };
  return scene.add.text(x, y, str, style).setOrigin(opts.originX ?? 0.5, opts.originY ?? 0.5);
}
