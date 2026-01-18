// src/config.js

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { OpeningScene } from './scenes/OpeningScene.js';
import { SettlementScene } from './scenes/SettlementScene.js';
import { EndingScene } from './scenes/EndingScene.js';

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  backgroundColor: '#1a1714',

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  scene: [BootScene, OpeningScene, SettlementScene, EndingScene],

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },

  render: {
    pixelArt: false,
    antialias: true
  }
};
