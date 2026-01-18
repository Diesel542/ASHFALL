// src/world/Settlement.js

import Phaser from 'phaser';
import { getGame } from '../core/GameManager.js';
import { LOCATIONS } from '../data/locations.js';
import { getNpcColor } from '../data/npcData.js';

/**
 * SETTLEMENT
 *
 * The game world map and location management.
 */

export class Settlement {
  constructor(scene) {
    this.scene = scene;
    this.locationMarkers = new Map();
    this.npcSprites = new Map();
    this.game = getGame();

    this.create();
  }

  create() {
    const { width, height } = this.scene.cameras.main;

    // Background
    this.scene.add.rectangle(width / 2, height / 2, width, height, 0x1a1714);

    // Create location markers
    this.createLocationMarkers();

    // Create NPC sprites
    this.createNpcSprites();

    // Create connections (visual lines between locations)
    this.createConnections();
  }

  createLocationMarkers() {
    const { width, height } = this.scene.cameras.main;

    // Position mapping (rough layout)
    const positions = {
      gate: { x: width * 0.1, y: height * 0.5, name: 'Gate' },
      market_square: { x: width * 0.35, y: height * 0.65, name: 'Market Square' },
      clinic: { x: width * 0.6, y: height * 0.3, name: 'Clinic' },
      watchtower: { x: width * 0.15, y: height * 0.2, name: 'Watchtower' },
      storehouse: { x: width * 0.45, y: height * 0.35, name: 'Storehouse' },
      well: { x: width * 0.35, y: height * 0.45, name: 'The Well' },
      perimeter_path: { x: width * 0.2, y: height * 0.75, name: 'Perimeter' },
      player_quarters: { x: width * 0.25, y: height * 0.55, name: 'Your Quarters' },
      sealed_shaft: { x: width * 0.5, y: height * 0.55, name: 'The Shaft' }
    };

    for (const [locId, pos] of Object.entries(positions)) {
      const marker = this.createLocationMarker(locId, pos);
      this.locationMarkers.set(locId, marker);
    }
  }

  createLocationMarker(locId, pos) {
    const isShaft = locId === 'sealed_shaft';
    const color = isShaft ? 0x442222 : 0x3d3832;
    const size = isShaft ? 40 : 25;

    // Marker circle
    const marker = this.scene.add.circle(pos.x, pos.y, size, color, 0.6);
    marker.setInteractive({ useHandCursor: true });
    marker.setDepth(10);

    // Hover effect
    marker.on('pointerover', () => {
      marker.setFillStyle(color, 0.9);
      this.showLocationTooltip(pos.x, pos.y - 40, pos.name);
    });

    marker.on('pointerout', () => {
      marker.setFillStyle(color, 0.6);
      this.hideLocationTooltip();
    });

    // Label
    const label = this.scene.add.text(pos.x, pos.y + size + 10, pos.name, {
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: '11px',
      color: '#6b6358'
    });
    label.setOrigin(0.5, 0);
    label.setDepth(11);

    // Special effect for shaft
    if (isShaft) {
      this.createShaftEffect(pos.x, pos.y);
    }

    return marker;
  }

  createShaftEffect(x, y) {
    // Pulsing glow
    const glow = this.scene.add.circle(x, y, 45, 0x442222, 0.2);
    glow.setDepth(9);

    this.scene.tweens.add({
      targets: glow,
      alpha: { from: 0.1, to: 0.3 },
      scale: { from: 1, to: 1.1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Rising dust
    this.scene.add.particles(x, y, 'dust-particle', {
      speed: { min: 5, max: 15 },
      angle: { min: 260, max: 280 },
      lifespan: 3000,
      alpha: { start: 0.4, end: 0 },
      quantity: 1,
      frequency: 800
    });
  }

  showLocationTooltip(x, y, text) {
    if (this.tooltip) this.tooltip.destroy();

    this.tooltip = this.scene.add.text(x, y, text, {
      fontFamily: 'Oswald, sans-serif',
      fontSize: '14px',
      color: '#e8dcc8',
      backgroundColor: '#1a1714',
      padding: { x: 8, y: 4 }
    });
    this.tooltip.setOrigin(0.5);
    this.tooltip.setDepth(1000);
  }

  hideLocationTooltip() {
    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = null;
    }
  }

  createNpcSprites() {
    const npcs = this.game.gsm.get('npcs');

    for (const [npcId, npcData] of Object.entries(npcs)) {
      const locPos = this.getLocationPosition(npcData.location);
      if (!locPos) continue;

      // Offset from location center
      const offset = this.getNpcOffset(npcId);
      const x = locPos.x + offset.x;
      const y = locPos.y + offset.y;

      const sprite = this.createNpcSprite(npcId, x, y);
      this.npcSprites.set(npcId, sprite);
    }
  }

  getNpcOffset(npcId) {
    const offsets = {
      mara: { x: 0, y: -20 },
      jonas: { x: 15, y: 0 },
      rask: { x: -20, y: 0 },
      edda: { x: 0, y: 20 },
      kale: { x: 20, y: 10 }
    };
    return offsets[npcId] || { x: 0, y: 0 };
  }

  createNpcSprite(npcId, x, y) {
    const color = getNpcColor(npcId);

    const sprite = this.scene.add.circle(x, y, 10, color);
    sprite.setInteractive({ useHandCursor: true });
    sprite.setDepth(50);

    // NPC name label
    const label = this.scene.add.text(x, y - 18, npcId.charAt(0).toUpperCase() + npcId.slice(1), {
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: '10px',
      color: '#a89a85'
    });
    label.setOrigin(0.5);
    label.setDepth(51);

    // Hover effect
    sprite.on('pointerover', () => {
      sprite.setScale(1.3);
      label.setColor('#e8dcc8');
    });

    sprite.on('pointerout', () => {
      sprite.setScale(1);
      label.setColor('#a89a85');
    });

    return sprite;
  }

  createConnections() {
    const connections = [
      ['gate', 'market_square'],
      ['gate', 'perimeter_path'],
      ['market_square', 'well'],
      ['market_square', 'player_quarters'],
      ['well', 'sealed_shaft'],
      ['well', 'storehouse'],
      ['storehouse', 'clinic'],
      ['storehouse', 'sealed_shaft'],
      ['watchtower', 'perimeter_path'],
      ['watchtower', 'storehouse']
    ];

    const graphics = this.scene.add.graphics();
    graphics.lineStyle(1, 0x3d3832, 0.3);

    for (const [from, to] of connections) {
      const fromPos = this.getLocationPosition(from);
      const toPos = this.getLocationPosition(to);

      if (fromPos && toPos) {
        graphics.lineBetween(fromPos.x, fromPos.y, toPos.x, toPos.y);
      }
    }

    graphics.setDepth(1);
  }

  // ═══════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════

  getLocationPosition(locationId) {
    const marker = this.locationMarkers.get(locationId);
    if (marker) {
      return { x: marker.x, y: marker.y };
    }
    return null;
  }

  getLocationData(locationId) {
    return LOCATIONS[locationId] || null;
  }

  getNpcsAtLocation(locationId) {
    const npcs = this.game.gsm.get('npcs');
    const result = [];

    for (const [npcId, npcData] of Object.entries(npcs)) {
      if (npcData.location === locationId) {
        result.push(npcId);
      }
    }

    return result;
  }

  // ═══════════════════════════════════════
  // NPC POSITION UPDATES
  // ═══════════════════════════════════════

  updateNpcPosition(npcId, newLocation) {
    const sprite = this.npcSprites.get(npcId);
    if (!sprite) return;

    const locPos = this.getLocationPosition(newLocation);
    if (!locPos) return;

    const offset = this.getNpcOffset(npcId);

    this.scene.tweens.add({
      targets: sprite,
      x: locPos.x + offset.x,
      y: locPos.y + offset.y,
      duration: 500,
      ease: 'Power2'
    });
  }
}
