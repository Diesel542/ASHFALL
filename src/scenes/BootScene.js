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
    // PORTRAITS (generated as placeholders)
    // ═══════════════════════════════════════

    // Portraits are now generated programmatically in createParticleTextures()
    // to allow testing without actual image assets

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

    // Create portrait placeholders
    this.createPortraitPlaceholders();
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

  createPortraitPlaceholders() {
    // NPC colors for portrait backgrounds
    const npcColors = {
      mara: 0x8b4513, // Saddle brown - leader
      jonas: 0x4a6741, // Forest green - healer
      rask: 0x5c4033, // Dark brown - enforcer
      edda: 0x4a4a6a, // Muted purple - elder
      kale: 0x6a5a4a // Taupe - mirror
    };

    // Mood tints (subtle color shifts)
    const moodTints = {
      // Mara
      guarded: 0x000000,
      commanding: 0x110000,
      cracking: 0x001100,
      // Jonas
      distant: 0x000011,
      pained: 0x110000,
      warmth: 0x111100,
      // Rask
      watching: 0x000000,
      warning: 0x110000,
      softness: 0x001111,
      // Edda
      cryptic: 0x000011,
      frightened: 0x110011,
      prophetic: 0x111111,
      // Kale
      eager: 0x111100,
      confused: 0x110011,
      slipping: 0x001111
    };

    const portraits = [
      { name: 'mara_guarded', npc: 'mara', mood: 'guarded' },
      { name: 'mara_commanding', npc: 'mara', mood: 'commanding' },
      { name: 'mara_cracking', npc: 'mara', mood: 'cracking' },
      { name: 'jonas_distant', npc: 'jonas', mood: 'distant' },
      { name: 'jonas_pained', npc: 'jonas', mood: 'pained' },
      { name: 'jonas_warmth', npc: 'jonas', mood: 'warmth' },
      { name: 'rask_watching', npc: 'rask', mood: 'watching' },
      { name: 'rask_warning', npc: 'rask', mood: 'warning' },
      { name: 'rask_softness', npc: 'rask', mood: 'softness' },
      { name: 'edda_cryptic', npc: 'edda', mood: 'cryptic' },
      { name: 'edda_frightened', npc: 'edda', mood: 'frightened' },
      { name: 'edda_prophetic', npc: 'edda', mood: 'prophetic' },
      { name: 'kale_eager', npc: 'kale', mood: 'eager' },
      { name: 'kale_confused', npc: 'kale', mood: 'confused' },
      { name: 'kale_slipping', npc: 'kale', mood: 'slipping' }
    ];

    // Portrait dimensions
    const width = 128;
    const height = 160;

    portraits.forEach(({ name, npc, mood }) => {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });

      // Background color with mood tint
      const baseColor = npcColors[npc];
      const tint = moodTints[mood];
      const finalColor = this.blendColors(baseColor, tint);

      // Fill background
      graphics.fillStyle(finalColor, 1);
      graphics.fillRect(0, 0, width, height);

      // Add subtle border
      graphics.lineStyle(2, 0x1a1714, 1);
      graphics.strokeRect(1, 1, width - 2, height - 2);

      // Add a darker inner rectangle for depth
      graphics.fillStyle(0x000000, 0.2);
      graphics.fillRect(8, 8, width - 16, height - 16);

      // Add character initial circle
      const initial = npc.charAt(0).toUpperCase();
      graphics.fillStyle(0xe8dcc8, 0.9);
      graphics.fillCircle(width / 2, height / 2 - 10, 30);

      // Generate texture
      graphics.generateTexture(name, width, height);
      graphics.destroy();

      // Add text overlay for initial (using a separate texture with text)
      this.createInitialOverlay(name, initial, width, height);
    });
  }

  createInitialOverlay(baseName, initial, width, height) {
    // Create a render texture to combine graphics with text
    const rt = this.make.renderTexture({ x: 0, y: 0, width, height, add: false });

    // Draw the base portrait
    rt.draw(baseName, 0, 0);

    // Add text for the initial
    const text = this.add.text(width / 2, height / 2 - 10, initial, {
      fontFamily: 'Oswald, sans-serif',
      fontSize: '32px',
      color: '#2d2a26',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);

    // Draw text onto render texture
    rt.draw(text, 0, 0);

    // Save as the final portrait texture (overwrite)
    rt.saveTexture(baseName);

    // Clean up
    text.destroy();
    rt.destroy();
  }

  blendColors(base, tint) {
    // Simple additive blend
    const r1 = (base >> 16) & 0xff;
    const g1 = (base >> 8) & 0xff;
    const b1 = base & 0xff;

    const r2 = (tint >> 16) & 0xff;
    const g2 = (tint >> 8) & 0xff;
    const b2 = tint & 0xff;

    const r = Math.min(255, r1 + r2);
    const g = Math.min(255, g1 + g2);
    const b = Math.min(255, b1 + b2);

    return (r << 16) | (g << 8) | b;
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
