// src/main.js

import Phaser from 'phaser';
import { gameConfig } from './config.js';
import { getGame } from './core/GameManager.js';

/**
 * ASHFALL — Main Entry Point
 *
 * "Small lives. Heavy truths. The earth remembers."
 */

// Get the singleton game manager
const Game = getGame();

// Initialize the Phaser game
const game = new Phaser.Game(gameConfig);

// Make Game manager globally accessible for debugging and scene access
window.AshfallGame = Game;

// Handle window focus/blur for pause
window.addEventListener('blur', () => {
  if (Game.gsm) {
    Game.gsm.events.emit('game:pause');
  }
});

window.addEventListener('focus', () => {
  if (Game.gsm) {
    Game.gsm.events.emit('game:resume');
  }
});

// Log startup
console.log(
  '%c ASHFALL ',
  'background: #1a1714; color: #e8dcc8; font-size: 20px; padding: 10px;'
);
console.log('%c The ground hums. Something waits below. ', 'color: #6b6358; font-style: italic;');

export { game, Game };
