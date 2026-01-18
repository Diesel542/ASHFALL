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

    // Load actual portrait images
    // Each NPC has one portrait used for all mood variants
    const npcs = ['mara', 'jonas', 'rask', 'edda', 'kale'];
    npcs.forEach((npc) => {
      this.load.image(`portrait_${npc}`, `assets/portraits/${npc}.png`);
    });

    // Handle load errors gracefully - create placeholders for missing images
    this.load.on('loaderror', (file) => {
      console.warn(`[BootScene] Failed to load: ${file.key}`);
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

  drawInitialLetter(graphics, letter, cx, cy) {
    // Simple block letter drawing for each NPC initial
    const size = 16;
    switch (letter) {
      case 'M': // Mara
        graphics.fillRect(cx - size, cy - size, 4, size * 2);
        graphics.fillRect(cx + size - 4, cy - size, 4, size * 2);
        graphics.fillRect(cx - size, cy - size, size, 4);
        graphics.fillRect(cx, cy - size, size, 4);
        graphics.fillRect(cx - 4, cy - size + 8, 8, 4);
        break;
      case 'J': // Jonas
        graphics.fillRect(cx - size, cy - size, size * 2, 4);
        graphics.fillRect(cx + 4, cy - size, 4, size * 2);
        graphics.fillRect(cx - size, cy + size - 8, size + 8, 4);
        graphics.fillRect(cx - size, cy + 4, 4, size - 4);
        break;
      case 'R': // Rask
        graphics.fillRect(cx - size, cy - size, 4, size * 2);
        graphics.fillRect(cx - size, cy - size, size + 4, 4);
        graphics.fillRect(cx - size, cy - 2, size + 4, 4);
        graphics.fillRect(cx + 4, cy - size, 4, size);
        graphics.fillRect(cx, cy + 2, 4, size - 4);
        graphics.fillRect(cx + 4, cy + 6, 4, size - 6);
        break;
      case 'E': // Edda
        graphics.fillRect(cx - size, cy - size, 4, size * 2);
        graphics.fillRect(cx - size, cy - size, size * 2, 4);
        graphics.fillRect(cx - size, cy - 2, size + 4, 4);
        graphics.fillRect(cx - size, cy + size - 4, size * 2, 4);
        break;
      case 'K': // Kale
        graphics.fillRect(cx - size, cy - size, 4, size * 2);
        graphics.fillRect(cx - size + 4, cy - 2, 4, 4);
        graphics.fillRect(cx - size + 8, cy - 6, 4, 4);
        graphics.fillRect(cx - size + 12, cy - 10, 4, 4);
        graphics.fillRect(cx - size + 8, cy + 2, 4, 4);
        graphics.fillRect(cx - size + 12, cy + 6, 4, 4);
        graphics.fillRect(cx - size + 16, cy + 10, 4, 4);
        break;
    }
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
    console.log('[BootScene] create() called');

    // Create portrait aliases for mood variants
    // Maps mood-specific keys to the base portrait
    this.createPortraitAliases();

    // Short delay then start opening scene
    this.time.delayedCall(1500, () => {
      console.log('[BootScene] Delay complete - starting fade out');
      this.cameras.main.fadeOut(500, 26, 23, 20);

      this.cameras.main.once('camerafadeoutcomplete', () => {
        console.log('[BootScene] Fade complete - transitioning to OpeningScene');
        this.scene.start('OpeningScene');
      });
    });
  }

  createPortraitAliases() {
    // Map all mood variants to the base portrait for each NPC
    const moodVariants = {
      mara: ['mara_guarded', 'mara_commanding', 'mara_cracking', 'mara_neutral'],
      jonas: ['jonas_distant', 'jonas_pained', 'jonas_warmth', 'jonas_neutral'],
      rask: ['rask_watching', 'rask_warning', 'rask_softness', 'rask_neutral'],
      edda: ['edda_cryptic', 'edda_frightened', 'edda_prophetic', 'edda_neutral'],
      kale: ['kale_eager', 'kale_confused', 'kale_slipping', 'kale_neutral']
    };

    for (const [npc, variants] of Object.entries(moodVariants)) {
      const baseKey = `portrait_${npc}`;

      // Check if the base portrait was loaded
      if (this.textures.exists(baseKey)) {
        console.log(`[BootScene] Creating aliases for ${npc} portrait`);

        // Create aliases for each mood variant
        variants.forEach((variant) => {
          if (!this.textures.exists(variant)) {
            // Add the texture under the variant name (alias to same image)
            const baseTexture = this.textures.get(baseKey);
            this.textures.addImage(variant, baseTexture.getSourceImage());
          }
        });
      } else {
        // Portrait not loaded - create placeholders
        console.log(`[BootScene] Creating placeholder for ${npc}`);
        this.createSinglePlaceholder(npc, variants);
      }
    }
  }

  createSinglePlaceholder(npc, variants) {
    const npcColors = {
      mara: 0x8b4513,
      jonas: 0x4a6741,
      rask: 0x5c4033,
      edda: 0x4a4a6a,
      kale: 0x6a5a4a
    };

    const width = 128;
    const height = 160;
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Fill background
    graphics.fillStyle(npcColors[npc] || 0x3d3832, 1);
    graphics.fillRect(0, 0, width, height);

    // Border
    graphics.lineStyle(2, 0x1a1714, 1);
    graphics.strokeRect(1, 1, width - 2, height - 2);

    // Inner shadow
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillRect(8, 8, width - 16, height - 16);

    // Initial circle
    graphics.fillStyle(0xe8dcc8, 0.9);
    graphics.fillCircle(width / 2, height / 2 - 10, 30);

    // Draw initial
    const initial = npc.charAt(0).toUpperCase();
    graphics.fillStyle(0x2d2a26, 1);
    this.drawInitialLetter(graphics, initial, width / 2, height / 2 - 10);

    // Generate for each variant
    variants.forEach((variant) => {
      graphics.generateTexture(variant, width, height);
    });

    graphics.destroy();
  }
}
