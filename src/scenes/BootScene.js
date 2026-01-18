// src/scenes/BootScene.js

import Phaser from 'phaser';

/**
 * BOOT SCENE
 *
 * Loads all assets before the game starts.
 * Shows a minimal loading screen.
 */

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading bar
    this.createLoadingBar();

    // ═══════════════════════════════════════
    // PORTRAITS
    // ═══════════════════════════════════════

    const portraits = [
      'mara_guarded',
      'mara_commanding',
      'mara_cracking',
      'jonas_distant',
      'jonas_pained',
      'jonas_warmth',
      'rask_watching',
      'rask_warning',
      'rask_softness',
      'edda_cryptic',
      'edda_frightened',
      'edda_prophetic',
      'kale_eager',
      'kale_confused',
      'kale_slipping'
    ];

    portraits.forEach((portrait) => {
      this.load.image(portrait, `assets/portraits/${portrait}.png`);
    });

    // ═══════════════════════════════════════
    // TILES (if using tilemap)
    // ═══════════════════════════════════════

    // this.load.image('tiles', 'assets/tiles/tileset.png');
    // this.load.tilemapTiledJSON('settlement', 'assets/tiles/settlement.json');

    // ═══════════════════════════════════════
    // SPRITES
    // ═══════════════════════════════════════

    // Player and NPC sprites (if using)
    // this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 32, frameHeight: 48 });
    // this.load.spritesheet('npc', 'assets/sprites/npc.png', { frameWidth: 32, frameHeight: 48 });

    // ═══════════════════════════════════════
    // AUDIO
    // ═══════════════════════════════════════

    // this.load.audio('hum', 'assets/audio/hum_loop.mp3');
    // this.load.audio('tremor', 'assets/audio/tremor.mp3');
    // this.load.audio('ambient', 'assets/audio/wind_ambient.mp3');

    // ═══════════════════════════════════════
    // PARTICLES
    // ═══════════════════════════════════════

    // Create simple particle textures programmatically
    this.createParticleTextures();
  }

  createLoadingBar() {
    const { width, height } = this.cameras.main;

    // Title
    const title = this.add.text(width / 2, height / 2 - 50, 'ASHFALL', {
      fontFamily: 'Oswald, sans-serif',
      fontSize: '48px',
      color: '#e8dcc8',
      letterSpacing: 8
    });
    title.setOrigin(0.5);

    // Loading text
    this.loadingText = this.add.text(width / 2, height / 2 + 20, 'Loading...', {
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: '14px',
      color: '#6b6358'
    });
    this.loadingText.setOrigin(0.5);

    // Progress bar background
    const barBg = this.add.rectangle(width / 2, height / 2 + 60, 300, 8, 0x2d2a26);

    // Progress bar fill
    this.progressBar = this.add.rectangle(width / 2 - 150, height / 2 + 60, 0, 8, 0x8b4513);
    this.progressBar.setOrigin(0, 0.5);

    // Progress events
    this.load.on('progress', (value) => {
      this.progressBar.width = 300 * value;
      this.loadingText.setText(`Loading... ${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      this.loadingText.setText('The ground hums...');
    });
  }

  createParticleTextures() {
    // Ash particle
    const ashGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    ashGraphics.fillStyle(0xccbbaa, 1);
    ashGraphics.fillCircle(4, 4, 3);
    ashGraphics.generateTexture('ash-particle', 8, 8);
    ashGraphics.destroy();

    // Dust particle
    const dustGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    dustGraphics.fillStyle(0x9b9085, 1);
    dustGraphics.fillCircle(2, 2, 2);
    dustGraphics.generateTexture('dust-particle', 4, 4);
    dustGraphics.destroy();

    // Isometric tile placeholder
    const tileGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    tileGraphics.fillStyle(0x8b7355, 1);
    tileGraphics.beginPath();
    tileGraphics.moveTo(32, 0);
    tileGraphics.lineTo(64, 16);
    tileGraphics.lineTo(32, 32);
    tileGraphics.lineTo(0, 16);
    tileGraphics.closePath();
    tileGraphics.fillPath();
    tileGraphics.generateTexture('tile_ground', 64, 32);
    tileGraphics.destroy();

    // Player placeholder
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x000000, 0.3);
    playerGraphics.fillEllipse(16, 44, 20, 8);
    playerGraphics.fillStyle(0xe8dcc8, 1);
    playerGraphics.fillRect(12, 16, 8, 24);
    playerGraphics.fillStyle(0xd4b896, 1);
    playerGraphics.fillCircle(16, 12, 8);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // NPC placeholder
    const npcGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    npcGraphics.fillStyle(0x000000, 0.3);
    npcGraphics.fillEllipse(16, 44, 20, 8);
    npcGraphics.fillStyle(0x7a6555, 1);
    npcGraphics.fillRect(12, 16, 8, 24);
    npcGraphics.fillStyle(0x9a8575, 1);
    npcGraphics.fillCircle(16, 12, 8);
    npcGraphics.generateTexture('npc', 32, 48);
    npcGraphics.destroy();
  }

  create() {
    // Short delay then start opening scene
    this.time.delayedCall(1500, () => {
      this.cameras.main.fadeOut(500, 26, 23, 20);

      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('OpeningScene');
      });
    });
  }
}
