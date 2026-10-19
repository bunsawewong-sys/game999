import Phaser from 'phaser';
import '@fontsource/chakra-petch/400.css';
import '@fontsource/chakra-petch/700.css';
import '@fontsource/press-start-2p/400.css';
import './style.css';

import { GAME_W, HEX, computeGameHeight } from './config.js';
import { audio } from './audio/AudioEngine.js';
import { storage } from './storage.js';
import { setLang } from './i18n.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { HudScene } from './scenes/HudScene.js';
import { UpgradeScene } from './scenes/UpgradeScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { LeaderboardScene } from './scenes/LeaderboardScene.js';

async function fontsReady() {
  const sample = 'ABCกขคฟ123';
  const loads = [
    document.fonts.load('16px "Press Start 2P"', 'ABC123'),
    document.fonts.load('16px "Chakra Petch"', sample),
    document.fonts.load('bold 16px "Chakra Petch"', sample),
  ];
  // Never block the game on fonts for more than a few seconds.
  await Promise.race([Promise.allSettled(loads), new Promise((r) => setTimeout(r, 4000))]);
}

function setupAudioUnlock() {
  const unlock = () => audio.unlock();
  for (const type of ['pointerdown', 'touchend', 'keydown']) {
    window.addEventListener(type, unlock, { passive: true });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) audio.suspend();
    else audio.resume();
  });
}

async function start() {
  const settings = storage.getSettings();
  setLang(settings.lang);
  audio.setVolumes(settings.sfx, settings.bgm);
  setupAudioUnlock();
  await fontsReady();

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: GAME_W,
    height: computeGameHeight(),
    backgroundColor: HEX.bg,
    pixelArt: true,
    banner: false,
    disableContextMenu: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { debug: false } },
    input: { activePointers: 2 },
    // Order here is also the draw order: later scenes render on top.
    scene: [
      BootScene,
      MenuScene,
      GameScene,
      HudScene,
      UpgradeScene,
      GameOverScene,
      PauseScene,
      LeaderboardScene,
      SettingsScene,
    ],
  });

  document.getElementById('loading')?.remove();
  if (new URLSearchParams(window.location.search).has('debug')) window.__fd = game;
}

start();
